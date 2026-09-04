import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import type { CalendarEvent } from "@/lib/market-news";

/**
 * Upcoming economic releases.
 *
 * A server component with no interactivity, so nothing here reaches the client
 * bundle. Times are printed in UTC rather than the visitor's zone: this renders
 * on the server and is cached, so a local-time string would be the server's idea
 * of local, and naming the zone makes the figure unambiguous for a reader in
 * Dubai looking at a release scheduled in London. IST is shown alongside UTC as
 * a fixed +5:30 conversion, since it's a large share of the audience and has no
 * DST to worry about.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** IST has no DST and sits a fixed +5:30 ahead of UTC year-round. */
const IST_OFFSET_MINUTES = 5 * 60 + 30;

/** "Mon 17 Aug" / "08:30", both in UTC, assembled by hand to avoid ICU. */
function parts(iso: string) {
  const at = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    day: `${DAYS[at.getUTCDay()]} ${at.getUTCDate()} ${MONTHS[at.getUTCMonth()]}`,
    time: `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`,
    dayKey: at.toISOString().slice(0, 10),
  };
}

/** Same wall-clock math as parts(), shifted to IST — a fixed offset, so no ICU needed here either. */
function istTime(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + IST_OFFSET_MINUTES * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

/** High is the only one that gets the gold; everything else recedes. */
const IMPACT_CLASSES: Record<CalendarEvent["impact"], string> = {
  High: "border-secondary/40 bg-secondary/[0.12] text-primary",
  Medium: "border-primary/12 bg-primary/[0.04] text-text",
  Low: "border-primary/10 bg-transparent text-text/70",
};

export default function EconomicCalendar({ events }: { events: CalendarEvent[] }) {
  return (
    <section
      id="calendar"
      className="bg-bg py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="economic calendar"
          title={
            <>
              What moves the market <em>next</em>
            </>
          }
        />

        {events.length === 0 ? (
          // Says so rather than rendering an empty table. A calendar that is
          // silently blank reads as "nothing is happening", which is a claim.
          <Reveal>
            <div className="rounded-[12px] border border-primary/10 bg-white px-6 py-10 text-center">
              <p className="font-mona text-[14.5px] leading-[170%] text-text">
                The calendar could not be loaded just now. It refreshes
                automatically — try again shortly.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="overflow-hidden rounded-[12px] border border-primary/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 px-5 py-3.5 sm:px-6">
                <span className="font-mona text-[12.5px] font-medium text-primary">
                  Next {events.length} releases
                </span>
                <span className="font-mona text-[11.5px] text-text/80">
                  High &amp; medium impact · times in UTC / IST
                </span>
              </div>

              {/* Scrolls in its own container so the page body never does. */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="bg-bg">
                      {["When", "Currency", "Release", "Forecast", "Previous", "Impact"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-5 py-2.5 font-mona text-[11px] font-semibold tracking-[0.07em] text-text uppercase sm:px-6"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, i) => {
                      const when = parts(event.at);
                      // The date is printed only when it changes, so a run of
                      // releases on one day reads as a block instead of
                      // repeating "Mon 17 Aug" six times.
                      const newDay =
                        i === 0 || parts(events[i - 1].at).dayKey !== when.dayKey;

                      return (
                        <tr
                          key={event.id}
                          className={`border-t ${
                            newDay ? "border-primary/[0.14]" : "border-primary/[0.06]"
                          }`}
                        >
                          <td className="px-5 py-3.5 whitespace-nowrap sm:px-6">
                            <span className="block font-mona text-[12.5px] font-medium tabular-nums text-primary">
                              {when.time} <span className="font-normal text-text/50">UTC</span>
                            </span>
                            <span className="mt-0.5 block font-mona text-[11px] tabular-nums text-secondary">
                              {istTime(event.at)} <span className="text-text/50">IST</span>
                            </span>
                            <span className="mt-0.5 block font-mona text-[11px] text-text">
                              {newDay ? when.day : ""}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 sm:px-6">
                            <span className="font-mona text-[12.5px] font-semibold tracking-[0.03em] text-primary">
                              {event.currency}
                            </span>
                          </td>
                          <th
                            scope="row"
                            className="max-w-[300px] px-5 py-3.5 font-mona text-[13px] font-medium text-primary sm:px-6"
                          >
                            {event.title}
                          </th>
                          <td className="px-5 py-3.5 font-mona text-[12.5px] tabular-nums whitespace-nowrap text-text sm:px-6">
                            {event.forecast || "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mona text-[12.5px] tabular-nums whitespace-nowrap text-text sm:px-6">
                            {event.previous || "—"}
                          </td>
                          <td className="px-5 py-3.5 sm:px-6">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-[3px] font-mona text-[10.5px] font-medium ${
                                IMPACT_CLASSES[event.impact]
                              }`}
                            >
                              {event.impact}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        <p className="mt-4 font-mona text-[12.5px] leading-[165%] text-text/80">
          Calendar data from ForexFactory. Forecasts are consensus estimates, not
          predictions — the number that matters is the surprise against them.
        </p>
      </div>
    </section>
  );
}
