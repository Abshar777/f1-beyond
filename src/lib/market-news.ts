import "server-only";
import { cache } from "react";
import { XMLParser } from "fast-xml-parser";

/**
 * Market news and the economic calendar.
 *
 * Both come from the publishers' own syndication channels, not from scraping.
 * That distinction is the whole design: fxstreet.com/news is client-side
 * rendered and answers a plain request with 200 and zero bytes, so reading the
 * page would mean driving a headless browser on every fetch — slow, fragile, and
 * the approach that got us blocked on ForexFactory. The RSS feed carries the
 * same newsroom output (verified headline-for-headline), with summaries,
 * timestamps and images already structured, and 30 items to the page's 12.
 *
 * The calendar is ForexFactory's own JSON feed on their CDN. The `/trades` page
 * sits behind a Cloudflare challenge; this does not.
 *
 * What we display is headline, summary, timestamp and a link back to the source.
 * Never the article body — syndication is what these feeds are published for,
 * republishing the writing is not.
 *
 * Caching follows `rates.ts`: one upstream call per revalidate window serves
 * every visitor, so traffic does not move the request count.
 */

/** News moves in minutes, not seconds; 15 is well inside anyone's patience. */
const NEWS_REVALIDATE = 900;
/** The calendar is a weekly file — hourly is already generous. */
const CALENDAR_REVALIDATE = 3600;

const TIMEOUT_MS = 8000;

const UA = "Mozilla/5.0 (compatible; BeyondpipsBot/1.0; +https://beyondpips.com)";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  /** ISO. */
  publishedAt: string;
  source: string;
  /** Always set — a feed image when the publisher supplies one, else a local. */
  image: string;
};

export type Impact = "High" | "Medium" | "Low";

export type CalendarEvent = {
  id: string;
  title: string;
  /** Currency code the release affects — USD, GBP, XAU-adjacent majors. */
  currency: string;
  /** ISO. */
  at: string;
  impact: Impact;
  forecast: string;
  previous: string;
};

type Feed = {
  name: string;
  url: string;
  /**
   * How many slots this source is guaranteed before recency is considered.
   *
   * Without a quota, sorting the merged list by date hands every slot to
   * whichever newsroom published most recently — and since forex closes at the
   * weekend while crypto does not, a Sunday visitor to a forex academy saw
   * twelve crypto headlines and no FX at all. Unused slots are still passed on,
   * so a dead feed costs nothing.
   */
  share: number;
};

/**
 * Ordered by how much they matter to this audience: forex and metals first,
 * crypto second. Reuters and Kitco are deliberately absent — Reuters retired its
 * public RSS and Kitco's metals feed 404s, so neither is an option however much
 * they look like the obvious picks.
 */
const FEEDS: Feed[] = [
  { name: "FXStreet", url: "https://www.fxstreet.com/rss/news", share: 8 },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    share: 4,
  },
];

const CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

/**
 * Local artwork for headlines that arrive without a picture.
 *
 * Needed because coverage is all-or-nothing per publisher rather than patchy:
 * FXStreet attaches an image to all 30 of its items and CoinDesk to none of its
 * 25, so a card either always has one or never does. The panel looked broken
 * whenever CoinDesk filled the slots.
 *
 * Served from `/assets/imgs/news/`, which holds copies resized to 480px — the
 * originals are up to 2.1MB each for a 96x72 thumbnail, so pointing at them
 * would have shipped ~6.7MB of images to render postage stamps. The full-size
 * files are left in place for any other use.
 *
 * `match` is tried in order and the first hit wins, so a headline about silver
 * gets the silver picture rather than a generic one. Anything unmatched falls
 * through to the generic pool, picked by a hash of the story so the same
 * headline always keeps the same image — a random pick would reshuffle every
 * revalidate and make the page flicker between builds.
 */
const NEWS_ART = "/assets/imgs/news";

const ART_MATCHES: { match: RegExp; file: string }[] = [
  { match: /\bsilver\b|\bxag\b/i, file: "Silver4.jpg" },
  { match: /\baud\b|aussie|australian dollar/i, file: "AUDUSD-bullish-animal.png" },
  { match: /\beur\b|euro\b|\becb\b/i, file: "EURUSD-bullish-line.png" },
  { match: /\bpeso\b|\bmxn\b|banxico/i, file: "mexican-peso-bull-03.jpg" },
  { match: /\bcnh\b|\bcny\b|yuan|renminbi|china|chinese/i, file: "usd-cnh-01.jpg" },
  // Last of the specific ones: "dollar" appears in half the forex headlines
  // ever written, so it must not out-rank a more precise match above.
  { match: /dollar index|\bdxy\b|greenback|\busd\b|dollar/i, file: "DollarIndex.png" },
];

const ART_GENERIC = ["Global-Concept_2.jpg", "discover-51.png"];

/** FNV-1a, so the same story resolves to the same picture on every render. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function artworkFor(title: string, key: string): string {
  const hit = ART_MATCHES.find((entry) => entry.match.test(title));
  const file = hit
    ? hit.file
    : ART_GENERIC[hash(key) % ART_GENERIC.length];
  return `${NEWS_ART}/${file}`;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

/** RSS values arrive as string, number or a `{ "#text": … }` node. */
function text(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"] ?? "");
  }
  return "";
}

/**
 * Strips tags and collapses whitespace.
 *
 * Feed descriptions are HTML, and this text is rendered as a plain string, so
 * anything left in it would show up as literal markup. It is never inserted as
 * HTML — there is no `dangerouslySetInnerHTML` anywhere near this.
 */
function plain(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** One sentence or so — enough to judge whether the link is worth following. */
function trim(value: string, max = 180): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trimEnd()}…`;
}

async function fetchFeed(feed: Feed): Promise<NewsItem[]> {
  try {
    const response = await fetch(feed.url, {
      headers: { "user-agent": UA },
      next: { revalidate: NEWS_REVALIDATE, tags: ["market-news"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[market-news] ${feed.name} returned ${response.status}`);
      return [];
    }

    const doc = parser.parse(await response.text());
    // A single-item feed parses to an object rather than an array.
    const raw = doc?.rss?.channel?.item;
    const items: Record<string, unknown>[] = Array.isArray(raw)
      ? raw
      : raw
        ? [raw]
        : [];

    return items
      .map((item): NewsItem | null => {
        const title = plain(text(item.title));
        const url = text(item.link).trim();
        const published = new Date(text(item.pubDate));

        // Anything without these three is unusable — no headline to show, no
        // link to follow, or no way to order it against the rest.
        if (!title || !url || Number.isNaN(published.getTime())) return null;

        const enclosure = item.enclosure as Record<string, string> | undefined;
        const supplied = enclosure?.["@_url"];
        const id = text(item.guid) || url;

        return {
          id,
          title,
          summary: trim(plain(text(item.description))),
          url,
          publishedAt: published.toISOString(),
          source: feed.name,
          // The publisher's own image is always preferred — it belongs to the
          // story. Local artwork is the fallback, never an override.
          image:
            supplied && /^https?:\/\//.test(supplied)
              ? supplied
              : artworkFor(title, id),
        };
      })
      .filter((item): item is NewsItem => item !== null);
  } catch (cause) {
    console.error(`[market-news] could not reach ${feed.name}:`, cause);
    return [];
  }
}

/**
 * Latest headlines across every feed, newest first.
 *
 * Per-source resilience rather than all-or-nothing: if CoinDesk is down,
 * FXStreet still renders. An empty array means every source failed, and the page
 * says so — a news panel must never invent a headline to fill space.
 */
const newestFirst = (a: NewsItem, b: NewsItem) =>
  b.publishedAt.localeCompare(a.publishedAt);

export const getMarketNews = cache(async (limit = 12): Promise<NewsItem[]> => {
  const results = await Promise.all(FEEDS.map(fetchFeed));

  // Aggregators occasionally repeat a story under two guids; the URL is the
  // thing a reader would notice twice.
  const seen = new Set<string>();
  const dedupe = (items: NewsItem[]) =>
    items.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

  const picked: NewsItem[] = [];
  const leftover: NewsItem[] = [];

  results.forEach((items, i) => {
    const ranked = dedupe(items).sort(newestFirst);
    picked.push(...ranked.slice(0, FEEDS[i].share));
    leftover.push(...ranked.slice(FEEDS[i].share));
  });

  // Whatever the quotas did not use goes to the freshest remaining stories, so a
  // feed being down or thin never leaves the panel short.
  if (picked.length < limit) {
    picked.push(...leftover.sort(newestFirst).slice(0, limit - picked.length));
  }

  return picked.sort(newestFirst).slice(0, limit);
});

function toImpact(value: unknown): Impact | null {
  const raw = String(value ?? "").toLowerCase();
  if (raw === "high") return "High";
  if (raw === "medium") return "Medium";
  if (raw === "low") return "Low";
  // "Holiday" and "Non-Economic" also appear; they carry no forecast and are not
  // tradeable events, so they are dropped rather than bucketed.
  return null;
}

/**
 * This week's releases, upcoming first.
 *
 * Filtered to High and Medium impact by default. The raw week runs to ~96
 * entries, three quarters of them low-impact prints that nobody positions
 * around — showing them all would bury the eight that actually move gold and the
 * majors.
 */
export const getEconomicCalendar = cache(
  async (
    { minImpact = "Medium", limit = 14 }: { minImpact?: Impact; limit?: number } = {},
  ): Promise<CalendarEvent[]> => {
    try {
      const response = await fetch(CALENDAR_URL, {
        headers: { "user-agent": UA },
        next: { revalidate: CALENDAR_REVALIDATE, tags: ["market-news"] },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        console.error(`[market-news] calendar returned ${response.status}`);
        return [];
      }

      const rows = (await response.json()) as Record<string, unknown>[];
      if (!Array.isArray(rows)) return [];

      const rank: Record<Impact, number> = { Low: 0, Medium: 1, High: 2 };
      const floor = rank[minImpact];
      // Events already past are dropped, but only after the fact — the point of a
      // calendar on a marketing page is what is coming, not what was missed.
      const now = Date.now();

      return rows
        .map((row): CalendarEvent | null => {
          const impact = toImpact(row.impact);
          const at = new Date(String(row.date ?? ""));
          const title = String(row.title ?? "").trim();
          if (!impact || !title || Number.isNaN(at.getTime())) return null;
          if (rank[impact] < floor) return null;

          return {
            id: `${row.country}-${title}-${at.toISOString()}`,
            title,
            currency: String(row.country ?? "").trim(),
            at: at.toISOString(),
            impact,
            forecast: String(row.forecast ?? "").trim(),
            previous: String(row.previous ?? "").trim(),
          };
        })
        .filter((event): event is CalendarEvent => event !== null)
        .filter((event) => new Date(event.at).getTime() >= now)
        .sort((a, b) => a.at.localeCompare(b.at))
        .slice(0, limit);
    } catch (cause) {
      console.error("[market-news] could not reach the calendar:", cause);
      return [];
    }
  },
);
