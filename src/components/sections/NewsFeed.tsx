import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import type { NewsItem } from "@/lib/market-news";

/**
 * Latest market headlines.
 *
 * Headline, summary, time and a link back to the publisher — never the article
 * body. These feeds are published for syndication, which is exactly this;
 * reproducing the writing itself would not be.
 *
 * Every link carries `rel="noopener"` and opens in a new tab: these are external
 * destinations we do not control, and `noopener` denies the opened page a handle
 * on `window.opener`.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// India has no DST, so a fixed +5:30 offset is exact — no ICU/timezone data needed.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * "08:30 IST" for today, "14 Aug 08:30 IST" otherwise.
 *
 * Absolute rather than relative ("2h ago"): this is a server component behind a
 * 15-minute cache, so a relative string would be baked in at render and drift
 * quietly stale. A timestamp cannot go wrong that way.
 */
function stamp(iso: string, now: Date) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";

  const atIST = new Date(at.getTime() + IST_OFFSET_MS);
  const nowIST = new Date(now.getTime() + IST_OFFSET_MS);

  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(atIST.getUTCHours())}:${pad(atIST.getUTCMinutes())} IST`;
  const sameDay = atIST.toISOString().slice(0, 10) === nowIST.toISOString().slice(0, 10);

  return sameDay
    ? time
    : `${atIST.getUTCDate()} ${MONTHS[atIST.getUTCMonth()]} ${time}`;
}

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  // One clock for the whole list, so two items rendered either side of midnight
  // cannot disagree about what "today" means.
  const now = new Date();

  return (
    <section
      id="headlines"
      className="bg-bg pb-20 min-[1400px]:pb-[90px] min-[1920px]:pb-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="headlines"
          title={
            <>
              What the desk is <em>reading</em>
            </>
          }
        />

        {items.length === 0 ? (
          <Reveal>
            <div className="rounded-[12px] border border-primary/10 bg-white px-6 py-10 text-center">
              <p className="font-mona text-[14.5px] leading-[170%] text-text">
                Headlines could not be loaded just now. The feed refreshes
                automatically — try again shortly.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal stagger className="grid gap-4 md:grid-cols-2 lg:gap-5">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 rounded-[12px] border border-primary/10 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-secondary/40"
              >
                {/* Decorative: the headline beside it already carries the
                    meaning, so an alt describing the picture would only add
                    noise for a screen reader. No longer conditional — every item
                    is guaranteed an image, the publisher's or a local one. */}
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="hidden h-[72px] w-[96px] shrink-0 rounded-md bg-primary/[0.04] object-cover sm:block"
                />
                <span className="block min-w-0">
                  <span className="mb-1.5 flex items-center gap-2">
                    <span className="font-mona text-[11px] font-semibold tracking-[0.06em] text-secondary uppercase">
                      {item.source}
                    </span>
                    <span aria-hidden className="text-primary/20">
                      ·
                    </span>
                    <time
                      dateTime={item.publishedAt}
                      className="font-mona text-[11px] tabular-nums text-text/80"
                    >
                      {stamp(item.publishedAt, now)}
                    </time>
                  </span>

                  <span className="mb-1.5 block font-mona text-[15px] leading-[140%] font-medium tracking-[-0.015em] text-primary transition-colors duration-300 group-hover:text-secondary">
                    {item.title}
                  </span>

                  {item.summary && (
                    <span className="line-clamp-2 block font-mona text-[13px] leading-[165%] text-text">
                      {item.summary}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </Reveal>
        )}

        <p className="mt-5 font-mona text-[12.5px] leading-[165%] text-text/80">
          Headlines and summaries are syndicated from their publishers and link
          back to the original. Beyondpips does not write them, and nothing here
          is a recommendation to trade.
        </p>
      </div>
    </section>
  );
}
