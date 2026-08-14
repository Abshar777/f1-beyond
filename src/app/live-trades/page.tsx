import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import LiveTape from "@/components/sections/LiveTape";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";

export const metadata: Metadata = {
  title: "Live trades — real executed prints, as they happen",
  description:
    "A live tape of executed trades straight from a public exchange feed, with what each column actually means and how to read order flow.",
  alternates: { canonical: "/live-trades" },
  openGraph: {
    title: "Live trades — real executed prints, as they happen",
    description:
      "Watch real trades print in real time, and learn what a tape can and cannot tell you.",
    url: "/live-trades",
  },
};

/** What each column means — the tape is only useful if it can be read. */
const COLUMNS = [
  {
    name: "Side",
    body: "Which party crossed the spread. A buy means someone lifted the offer rather than waiting at the bid — they wanted in now and paid for the privilege.",
  },
  {
    name: "Size",
    body: "The quantity that changed hands in that single print. Large prints among small ones are worth more attention than any one price level.",
  },
  {
    name: "Value",
    body: "Size multiplied by price, in dollars. It is the honest measure of whether a print matters — 0.4 of one instrument and 400 of another are not comparable.",
  },
];

const LESSONS = [
  {
    title: "A print is a fact, a chart is a summary",
    body: "Every candle you have ever traded is built from prints like these. The tape is the raw material; the chart is what is left after most of the detail is thrown away.",
  },
  {
    title: "Aggression has a direction",
    body: "Sustained buying at the offer is a different market from the same price drifting up on thin volume. The tape distinguishes them; a closing price cannot.",
  },
  {
    title: "Speed is not opportunity",
    body: "Prints arriving faster feels like something is happening. Usually it means spreads are widening and fills are getting worse — the two moments most likely to cost a new trader money.",
  },
];

export default function LiveTradesPage() {
  return (
    <PageShell>
      {/* ── page header ── */}
      <section className="relative overflow-hidden bg-bg pt-[104px] pb-4 sm:pt-[120px] lg:pt-[132px]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-18%] left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Reveal y={20} className="mb-5">
            <nav aria-label="Breadcrumb" className="font-mona text-[13px] text-text">
              <Link href="/" className="transition-colors hover:text-secondary">
                Home
              </Link>
              <span className="mx-2 text-primary/25">/</span>
              <span className="text-primary">Live trades</span>
            </nav>
          </Reveal>

          <div className="mx-auto max-w-[760px] text-center">
            <SectionHeading
              eyebrow="order flow"
              className="!mb-6"
              title={
                <>
                  Every trade below actually <em>happened</em>
                </>
              }
            />
            <Reveal>
              <p className="font-mona text-[17px] leading-[178%] text-text">
                Not a simulation and not our positions — executed prints from a
                public exchange feed, arriving in your browser as they occur.
                Most traders have never watched one. It is worth an hour of your
                attention before you place another order.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <LiveTape />

      {/* ── reading the tape ── */}
      <section className="bg-bg pb-20 lg:pb-[90px]">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <SectionHeading
              eyebrow="how to read it"
              title={
                <>
                  Three columns that carry the <em>signal</em>
                </>
              }
            />
          </div>

          <Reveal stagger className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {COLUMNS.map((column) => (
              <div
                key={column.name}
                className="rounded-[12px] border border-primary/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40"
              >
                <h3 className="mb-2.5 font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  {column.name}
                </h3>
                <p className="font-mona text-[14.5px] leading-[172%] text-text">
                  {column.body}
                </p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-12 lg:mt-16">
            <div className="mx-auto max-w-[760px]">
              <SectionHeading
                eyebrow="what it teaches"
                title={
                  <>
                    What a tape can and cannot <em>tell you</em>
                  </>
                }
              />
            </div>
          </Reveal>

          <Reveal stagger className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {LESSONS.map((lesson, i) => (
              <div
                key={lesson.title}
                className="rounded-[12px] border border-primary/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40"
              >
                <span className="gold-surface mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mona text-[14px] font-semibold text-primary">
                  {i + 1}
                </span>
                <h3 className="mb-2.5 font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  {lesson.title}
                </h3>
                <p className="font-mona text-[14.5px] leading-[172%] text-text">
                  {lesson.body}
                </p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <div className="relative overflow-hidden rounded-[12px] border border-secondary/25 bg-primary p-8 text-center lg:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 70% at 50% 0%, rgba(212,175,55,0.16), transparent 65%)",
                }}
              />
              <div className="relative">
                <h3 className="mx-auto mb-3 max-w-[520px] font-mona text-[23px] leading-[130%] font-medium tracking-[-0.025em] text-white lg:text-[27px]">
                  Watching the tape is a skill. We teach it on real charts, live.
                </h3>
                <p className="mx-auto mb-8 max-w-[480px] font-mona text-[14.5px] leading-[172%] text-white/55">
                  Every package is free while the desk is opening up — including
                  the sessions where a mentor talks through flow as it happens.
                </p>
                <div className="flex justify-center">
                  <ThemeButton variant="secondary">Talk to the desk</ThemeButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
