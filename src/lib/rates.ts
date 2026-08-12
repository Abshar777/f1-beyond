import "server-only";
import { cache } from "react";

/**
 * Live market rates from Open Exchange Rates.
 *
 * One upstream endpoint feeds both consumers — the hero's metal badges and the
 * pip calculator's `quoteToUsd` table — because `latest.json` returns every
 * currency *and* the spot metals in a single response. That is the reason this
 * provider was chosen over the forex-only ones: no second request, no second
 * vendor, no second key.
 *
 * Quota: the free plan allows 1,000 requests/month and reprices hourly.
 * Refreshing faster than the upstream repriced would burn quota re-fetching
 * identical numbers, so `latest` is held for two hours (~372/month) and the
 * previous close for a day (~31/month) — roughly 40% of the allowance, leaving
 * headroom for preview deploys. Because the requests are keyed by URL, Next's
 * data cache serves every page and every visitor from one upstream call per
 * window, so traffic does not move these numbers at all.
 *
 * Nothing here throws. Every failure — missing key, upstream down, malformed
 * payload, a rate of zero — degrades to `FALLBACK`, so the site renders the
 * figures it shipped with rather than an error or an empty badge.
 */

/**
 * Overridable purely as a test seam: the free plan allows 1,000 requests a
 * month, so pointing this at a local stub is the only way to exercise the live
 * path — and its failure paths — without spending real quota. Unset in
 * production, where it falls through to the real host.
 */
const ENDPOINT =
  process.env.OPEN_EXCHANGE_RATES_ENDPOINT ?? "https://openexchangerates.org/api";

/** Two hours. The free plan only reprices hourly. */
const LATEST_REVALIDATE = 7200;
/** A day — the previous close does not change once the day has closed. */
const PREV_CLOSE_REVALIDATE = 86_400;

/** Upstream is occasionally slow to answer; never hang a page render on it. */
const TIMEOUT_MS = 6000;

export type MetalSymbol = "XAU" | "XAG" | "XPT";
/** The quote currencies we need a USD conversion for. */
export type QuoteCurrency = "JPY" | "CHF" | "CAD" | "GBP";

export type MetalQuote = {
  /** USD per troy ounce. */
  price: number;
  /** Percent move against the previous close; null when that is unavailable. */
  changePct: number | null;
};

export type MarketRates = {
  metals: Record<MetalSymbol, MetalQuote>;
  /** USD per 1 unit of the currency — exactly what the pip maths needs. */
  quoteToUsd: Record<QuoteCurrency, number>;
  /** When upstream last repriced, as an ISO string. Null while on fallback. */
  asOf: string | null;
  /** False when these are the shipped defaults rather than a live quote. */
  live: boolean;
};

/**
 * Used when a missing key or a dead upstream leaves nothing live to show, so
 * that case degrades to plausible numbers rather than a hole in the page.
 *
 * The currency rates are real closes for 11 Aug 2026, which is what makes the
 * no-key path usable: the figures these replaced had drifted 1–8.5% (CHF alone
 * was 8.5% out), and pip value is directly proportional to them, so a stale
 * conversion silently mis-sizes every position the calculator suggests.
 *
 * They still drift from the day they were written — that is the whole reason for
 * the live feed. Treat them as a floor, not a source of truth, and re-check them
 * if this ever ships without an App ID.
 *
 * The metal `price` figures are stale placeholders and are deliberately not
 * relied on: nothing renders a metal price today, only `changePct`. If a price
 * ever does get displayed, it must come from the live feed, not from here.
 */
const FALLBACK: MarketRates = {
  metals: {
    XAU: { price: 2391.4, changePct: 0.74 },
    XAG: { price: 28.14, changePct: 1.12 },
    XPT: { price: 962.8, changePct: -0.35 },
  },
  quoteToUsd: {
    JPY: 1 / 158.951,
    CHF: 1 / 0.8095,
    CAD: 1 / 1.3939,
    GBP: 1 / 0.7404,
  },
  asOf: null,
  live: false,
};

type OxrPayload = {
  timestamp?: number;
  base?: string;
  rates?: Record<string, number>;
};

/**
 * Fetches one OXR document.
 *
 * Deliberately does *not* send `symbols`. Narrowing the response is a paid-plan
 * "advanced query" — on the free plan it is rejected rather than ignored, which
 * would fail every request. The full document is a few KB, so filtering it here
 * costs nothing.
 */
async function fetchDocument(
  path: string,
  revalidate: number,
): Promise<OxrPayload | null> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!appId) return null;

  try {
    const response = await fetch(`${ENDPOINT}/${path}?app_id=${appId}`, {
      next: { revalidate, tags: ["market-rates"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // OXR describes its own failures in the body (invalid_app_id,
      // not_allowed, access_restricted); the status alone would not say which.
      const detail = await response.text().catch(() => "");
      console.error(
        `[rates] ${path} returned ${response.status}: ${detail.slice(0, 200)}`,
      );
      return null;
    }

    return (await response.json()) as OxrPayload;
  } catch (cause) {
    console.error(`[rates] could not reach ${path}:`, cause);
    return null;
  }
}

/** A rate is only usable if it is a finite positive number — we divide by it. */
function usable(rate: number | undefined): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

/**
 * OXR quotes metals the same way it quotes currencies: units per USD. So the
 * gold "rate" is ~0.00023 and the price a reader expects is its reciprocal.
 */
function priceFromRate(rate: number) {
  return 1 / rate;
}

/**
 * Order-of-magnitude sanity bands for a derived spot price, in USD/oz.
 *
 * The reciprocal above is the one assumption in this file that fails silently:
 * if upstream ever quoted metals the other way round, gold would render as
 * "$0.0003" with no error anywhere. These bands are deliberately far too wide to
 * express a market view — they only catch an inverted or mis-scaled convention.
 */
const PLAUSIBLE_PRICE: Record<MetalSymbol, [min: number, max: number]> = {
  XAU: [200, 50_000],
  XAG: [1, 1_000],
  XPT: [100, 20_000],
};

/** Yesterday in UTC. */
function previousDay(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

const METAL_SYMBOLS: MetalSymbol[] = ["XAU", "XAG", "XPT"];
const QUOTE_CURRENCIES: QuoteCurrency[] = ["JPY", "CHF", "CAD", "GBP"];

/**
 * Live rates, or the shipped defaults.
 *
 * Wrapped in React `cache()` so the several components that need rates in one
 * render share a single result. The Next data cache handles reuse *across*
 * renders and requests; this handles it within one.
 */
export const getMarketRates = cache(async (): Promise<MarketRates> => {
  const latest = await fetchDocument("latest.json", LATEST_REVALIDATE);
  const rates = latest?.rates;

  if (!rates) return FALLBACK;

  // All four currencies and all three metals have to be present and sane. A
  // partial merge would leave the calculator quietly mixing a live JPY with a
  // two-year-old CHF, which is worse than being uniformly stale.
  const missing = [...METAL_SYMBOLS, ...QUOTE_CURRENCIES].filter(
    (symbol) => !usable(rates[symbol]),
  );
  if (missing.length > 0) {
    console.error(`[rates] payload missing usable rates for: ${missing.join(", ")}`);
    return FALLBACK;
  }

  // Previous close is a nice-to-have: without it the badges simply omit the
  // percentage rather than the page falling back wholesale.
  const previous = await fetchDocument(
    `historical/${previousDay()}.json`,
    PREV_CLOSE_REVALIDATE,
  );
  const previousRates = previous?.rates;

  const metals = {} as Record<MetalSymbol, MetalQuote>;
  for (const symbol of METAL_SYMBOLS) {
    const price = priceFromRate(rates[symbol]);
    const [min, max] = PLAUSIBLE_PRICE[symbol];

    if (price < min || price > max) {
      console.error(
        `[rates] ${symbol} derived as ${price} USD/oz, outside ${min}–${max} — ` +
          `upstream may have changed how metals are quoted. Falling back.`,
      );
      return FALLBACK;
    }

    const before = previousRates?.[symbol];
    metals[symbol] = {
      price,
      changePct: usable(before)
        ? ((price - priceFromRate(before)) / priceFromRate(before)) * 100
        : null,
    };
  }

  const quoteToUsd = {} as Record<QuoteCurrency, number>;
  for (const currency of QUOTE_CURRENCIES) {
    // `rates.JPY` is JPY per USD; the pip maths wants USD per JPY.
    quoteToUsd[currency] = 1 / rates[currency];
  }

  return {
    metals,
    quoteToUsd,
    asOf: latest?.timestamp
      ? new Date(latest.timestamp * 1000).toISOString()
      : null,
    live: true,
  };
});
