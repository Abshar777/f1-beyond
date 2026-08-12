"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
// Types only — erased at compile time, so rates.ts's `server-only` guard never
// reaches this client bundle.
import type { MarketRates, QuoteCurrency } from "@/lib/rates";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

/**
 * Instrument table for the pip maths.
 *
 * `quoteToUsd` converts one unit of the pair's *quote* currency into USD, which
 * is the only rate the calculation actually needs — pip value always lands in
 * the quote currency first:
 *
 *   pip value = pipSize x unitsPerLot x quoteToUsd
 *
 * So USD-quoted pairs (EUR/USD, GBP/USD…) are exactly $10 a pip per standard
 * lot, USD-base pairs divide by their own rate, and the JPY crosses all share
 * USD/JPY because JPY is the quote on every one of them.
 *
 * `quoteCurrency` names the rate each pair needs rather than baking a number in.
 * USD-quoted rows have no entry because their conversion is exactly 1 — no feed
 * required, and no feed outage can break them.
 */
type Instrument = {
  pair: string;
  pipSize: number;
  /** Which live rate converts this pair's pip into USD. Absent ⇒ already USD. */
  quoteCurrency?: QuoteCurrency;
  /** Contract size. Spot metals trade in ounces, not 100k currency units. */
  unitsPerLot: number;
  unitLabel: string;
};

const INSTRUMENTS: Instrument[] = [
  { pair: "EUR/USD", pipSize: 0.0001, unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "GBP/USD", pipSize: 0.0001, unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "AUD/USD", pipSize: 0.0001, unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "USD/JPY", pipSize: 0.01, quoteCurrency: "JPY", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "USD/CHF", pipSize: 0.0001, quoteCurrency: "CHF", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "USD/CAD", pipSize: 0.0001, quoteCurrency: "CAD", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "EUR/JPY", pipSize: 0.01, quoteCurrency: "JPY", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "GBP/JPY", pipSize: 0.01, quoteCurrency: "JPY", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "EUR/GBP", pipSize: 0.0001, quoteCurrency: "GBP", unitsPerLot: 100_000, unitLabel: "units" },
  { pair: "XAU/USD", pipSize: 0.01, unitsPerLot: 100, unitLabel: "oz" },
];

/**
 * The rates the site shipped with, used when no live set is handed in.
 *
 * Mirrors `FALLBACK` in `lib/rates.ts` so this component renders sane numbers
 * even if mounted with no props at all.
 */
const FALLBACK_QUOTE_TO_USD: Record<QuoteCurrency, number> = {
  JPY: 1 / 158.951,
  CHF: 1 / 0.8095,
  CAD: 1 / 1.3939,
  GBP: 1 / 0.7404,
};

/**
 * Formatted by hand rather than with `toLocaleString`: this is a client
 * component, so it still renders on the server, and leaning on the runtime's
 * ICU data for the first paint invites a hydration mismatch between Node and
 * the browser.
 */
function group(value: string) {
  const [whole, fraction] = value.split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${spaced}.${fraction}` : spaced;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * "11 Aug 14:00 UTC" from an ISO timestamp.
 *
 * Read in UTC and assembled by hand for the same reason as `group` above, only
 * more so: a locale-formatted local time differs between the server's timezone
 * and the visitor's, which is a guaranteed hydration mismatch rather than a
 * possible one. Naming the zone also makes the figure unambiguous for a reader
 * in Dubai looking at a rate priced in London.
 */
function formatAsOf(iso: string) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "recently";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getUTCDate()} ${MONTHS[at.getUTCMonth()]} ${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())} UTC`;
}

const money = (n: number) => `$${group(n.toFixed(2))}`;
const decimals = (n: number, places: number) => group(n.toFixed(places));

/** Blank and half-typed values ("", "-", "2.") must read as "no input yet". */
function parse(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) ? n : null;
}

const FIELD_CLASSES =
  "w-full rounded-md border border-primary/10 bg-bg px-4 py-3 font-mona text-[15px] font-medium text-primary outline-none transition-colors duration-200 focus:border-secondary";

const LABEL_CLASSES =
  "mb-2 block font-mona text-[13px] font-medium tracking-[-0.01em] text-text";

function Readout({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "rounded-md border border-secondary/25 bg-white/[0.04] px-5 py-5"
          : "flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-3.5"
      }
    >
      <span
        className={`font-mona text-[13px] ${
          emphasis ? "mb-1.5 block text-white/50" : "text-white/55"
        }`}
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? "gold-shine block font-mona text-[34px] leading-none font-medium tracking-[-0.03em] sm:text-[40px]"
            : "font-mona text-[15px] font-medium text-white"
        }
      >
        {value}
      </span>
      {hint ? (
        <span className="mt-2 block font-mona text-[12px] text-white/40">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Pip calculator — position sizing from a risk budget.
 *
 * Deliberately the risk-first form of the tool rather than a bare pip-value
 * lookup: "how many lots may I trade if I am only willing to lose 1% on this
 * stop" is the calculation the programme actually teaches, and it makes the
 * pip value a step in the working rather than the answer.
 */
export default function PipCalculator({
  /**
   * Render the section's own eyebrow + heading. Off on `/pip-calculator`, where
   * the page already introduces the tool — leaving it on stacked two "Trader
   * tools" eyebrows and two near-identical headings, which read as a bug.
   */
  heading = true,
  /**
   * Live USD conversions from the server. Omitted or partial, the shipped
   * defaults stand in — the calculator must always produce a number.
   */
  quoteToUsd,
  /** When the live set was priced, for the note under the pair selector. */
  asOf = null,
}: {
  heading?: boolean;
  quoteToUsd?: MarketRates["quoteToUsd"];
  asOf?: string | null;
} = {}) {
  const [pair, setPair] = useState(INSTRUMENTS[0].pair);
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [stop, setStop] = useState("25");

  const rates = quoteToUsd ?? FALLBACK_QUOTE_TO_USD;

  const result = useMemo(() => {
    const instrument =
      INSTRUMENTS.find((i) => i.pair === pair) ?? INSTRUMENTS[0];
    // USD-quoted pairs convert at exactly 1, so they need no rate at all.
    const conversion = instrument.quoteCurrency
      ? rates[instrument.quoteCurrency]
      : 1;
    const pipValuePerLot =
      instrument.pipSize * instrument.unitsPerLot * conversion;

    const balanceValue = parse(balance);
    const riskValue = parse(risk);
    const stopValue = parse(stop);

    // Every downstream figure divides by stop x pip value, so a zero or
    // negative stop has no answer rather than an infinite one.
    const solvable =
      balanceValue !== null &&
      riskValue !== null &&
      stopValue !== null &&
      balanceValue > 0 &&
      riskValue > 0 &&
      stopValue > 0;

    if (!solvable) return { instrument, pipValuePerLot, solvable: false as const };

    const riskAmount = (balanceValue * riskValue) / 100;
    const lots = riskAmount / (stopValue * pipValuePerLot);

    return {
      instrument,
      pipValuePerLot,
      solvable: true as const,
      riskAmount,
      lots,
      units: lots * instrument.unitsPerLot,
      pipValueAtSize: lots * pipValuePerLot,
    };
  }, [pair, balance, risk, stop, rates]);

  const { instrument, pipValuePerLot } = result;

  return (
    <section
      id="pip-calculator"
      className="bg-bg py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {heading && (
          <SectionHeading
            eyebrow="Trader tools"
            title={
              <>
                Size every trade with the <em>pip calculator</em>
              </>
            }
          />
        )}

        <Reveal>
          <div className="grid overflow-hidden rounded-[10px] border border-primary/10 bg-white lg:grid-cols-[1fr_0.9fr]">
            {/* ── inputs ── */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-7 flex items-center gap-2.5">
                <span className="gold-surface flex h-9 w-9 shrink-0 items-center justify-center rounded bg-secondary text-white">
                  <Calculator size={17} strokeWidth={2.2} aria-hidden />
                </span>
                <h3 className="font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  Your trade
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASSES} htmlFor="pip-pair">
                    Instrument
                  </label>
                  <div className="relative">
                    <select
                      id="pip-pair"
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                      className={`${FIELD_CLASSES} cursor-pointer appearance-none pr-11`}
                    >
                      {INSTRUMENTS.map((i) => (
                        <option key={i.pair} value={i.pair}>
                          {i.pair}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
                      width="11"
                      height="7"
                      viewBox="0 0 11 7"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l4.5 4.5L10 1"
                        stroke="#09090b"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASSES} htmlFor="pip-balance">
                    Account balance (USD)
                  </label>
                  <input
                    id="pip-balance"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className={FIELD_CLASSES}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASSES} htmlFor="pip-stop">
                    Stop loss (pips)
                  </label>
                  <input
                    id="pip-stop"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={stop}
                    onChange={(e) => setStop(e.target.value)}
                    className={FIELD_CLASSES}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL_CLASSES} htmlFor="pip-risk">
                    Risk per trade
                    <span className="ml-1.5 font-medium text-primary">
                      {risk === "" ? "—" : `${risk}%`}
                    </span>
                  </label>
                  <input
                    id="pip-risk"
                    type="range"
                    min="0.25"
                    max="5"
                    step="0.25"
                    value={risk === "" ? "1" : risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/10 accent-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                  />
                  <div className="mt-2 flex justify-between font-mona text-[12px] text-text">
                    <span>0.25%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>

              <p className="mt-7 flex gap-2.5 border-t border-primary/10 pt-5 font-mona text-[13px] leading-[165%] text-text">
                <Info
                  size={15}
                  strokeWidth={2.2}
                  className="mt-[3px] shrink-0 text-secondary"
                  aria-hidden
                />
                One pip is {instrument.pipSize} on {instrument.pair}, and a
                standard lot is{" "}
                {group(instrument.unitsPerLot.toString())}{" "}
                {instrument.unitLabel}.{" "}
                {asOf ? (
                  <>
                    Conversion rates updated{" "}
                    <time dateTime={asOf}>{formatAsOf(asOf)}</time>.
                  </>
                ) : (
                  <>Conversion rates are indicative reference figures.</>
                )}{" "}
                Always size off your broker&apos;s live quote before you place
                the order — their spread and fill are what you actually get.
              </p>
            </div>

            {/* ── readout ── */}
            <div className="relative overflow-hidden bg-primary p-6 sm:p-8 lg:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(80% 80% at 92% 4%, rgba(212,175,55,0.16), transparent 62%)",
                }}
              />
              <div className="relative">
                <h3 className="mb-6 font-mona text-[13px] font-medium tracking-[0.08em] text-white/45 uppercase">
                  Position size
                </h3>

                {result.solvable ? (
                  <>
                    <Readout
                      emphasis
                      label={`Lots on ${instrument.pair}`}
                      value={decimals(result.lots, 2)}
                      hint={`${decimals(result.units, 0)} ${instrument.unitLabel}`}
                    />
                    <div className="mt-6">
                      <Readout
                        label="Risk on this trade"
                        value={money(result.riskAmount)}
                      />
                      <Readout
                        label="Value per pip at that size"
                        value={money(result.pipValueAtSize)}
                      />
                      <Readout
                        label="Value per pip per standard lot"
                        value={money(pipValuePerLot)}
                      />
                      <Readout
                        label="Loss if the stop is hit"
                        value={`−${money(result.riskAmount)}`}
                      />
                    </div>
                  </>
                ) : (
                  <p className="font-mona text-[15px] leading-[170%] text-white/50">
                    Enter a balance, a stop distance and a risk percentage above
                    — all three need to be greater than zero before a position
                    size can be worked out.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
