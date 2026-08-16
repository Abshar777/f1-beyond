import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import EconomicCalendar from "@/components/sections/EconomicCalendar";
import NewsFeed from "@/components/sections/NewsFeed";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";
import { getEconomicCalendar, getMarketNews } from "@/lib/market-news";

export const metadata: Metadata = {
  title: "Market news & economic calendar",
  description:
    "Live forex, metals and crypto headlines alongside the week's high-impact economic releases — what is coming, what is forecast, and what it moves.",
  alternates: { canonical: "/market-news" },
  openGraph: {
    title: "Market news & economic calendar",
    description:
      "The releases that move gold and the majors this week, with the headlines around them.",
    url: "/market-news",
  },
};

const READING_THE_CALENDAR = [
  {
    title: "The surprise is the move",
    body: "Price does not react to the number, it reacts to the gap between the number and the forecast. A 2.9% CPI print against a 2.9% forecast is a non-event; the same print against 2.5% is not.",
  },
  {
    title: "Impact means volatility, not direction",
    body: "A high-impact flag tells you the spread will widen and the candle will be long. It says nothing whatsoever about which way. Traders who confuse the two get stopped out on the wick.",
  },
  {
    title: "The plan comes before the print",
    body: "Deciding what you will do at 08:29 is a strategy. Deciding at 08:31 is a reaction. Most account damage around releases is done by people who had no position on the event and took one anyway.",
  },
];

export default async function MarketNewsPage() {
  // Independent sources, so they overlap rather than queue.
  const [events, news] = await Promise.all([
    getEconomicCalendar({ minImpact: "Medium", limit: 14 }),
    getMarketNews(12),
  ]);

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
              <span className="text-primary">Market news</span>
            </nav>
          </Reveal>

          <div className="mx-auto max-w-[760px] text-center">
            <SectionHeading
              eyebrow="the wire"
              className="!mb-6"
              title={
                <>
                  Know what is coming before it <em>prints</em>
                </>
              }
            />
            <Reveal>
              <p className="font-mona text-[17px] leading-[178%] text-text">
                The week&apos;s high-impact releases with their forecasts, and the
                headlines moving forex, metals and crypto right now. Traders do
                not check the news at half past eight — they check what lands at
                half past eight.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <EconomicCalendar events={events} />
      <NewsFeed items={news} />

      {/* ── how to use it ── */}
      <section className="bg-bg pb-20 lg:pb-[90px]">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <SectionHeading
              eyebrow="how to use it"
              title={
                <>
                  Three rules for trading around a <em>release</em>
                </>
              }
            />
          </div>

          <Reveal stagger className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {READING_THE_CALENDAR.map((rule, i) => (
              <div
                key={rule.title}
                className="rounded-[12px] border border-primary/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40"
              >
                <span className="gold-surface mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mona text-[14px] font-semibold text-primary">
                  {i + 1}
                </span>
                <h3 className="mb-2.5 font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  {rule.title}
                </h3>
                <p className="font-mona text-[14.5px] leading-[172%] text-text">
                  {rule.body}
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
                <h3 className="mx-auto mb-3 max-w-[560px] font-mona text-[23px] leading-[130%] font-medium tracking-[-0.025em] text-white lg:text-[27px]">
                  We sit the big releases with our students, live.
                </h3>
                <p className="mx-auto mb-8 max-w-[480px] font-mona text-[14.5px] leading-[172%] text-white/55">
                  Every package is free while the desk is opening up — including
                  the sessions where a mentor talks through a print as it lands.
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
