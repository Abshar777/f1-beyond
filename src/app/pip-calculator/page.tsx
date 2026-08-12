import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PipCalculator from "@/components/sections/PipCalculator";
import { getMarketRates } from "@/lib/rates";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";

export const metadata: Metadata = {
  title: "Pip calculator — position sizing from a risk budget",
  description:
    "Work out lot size, pip value and risk per trade across forex, JPY crosses and spot gold. Free, no sign-up.",
  alternates: { canonical: "/pip-calculator" },
  openGraph: {
    title: "Pip calculator — position sizing from a risk budget",
    description:
      "Set your balance, risk and stop distance; get the position size that keeps the loss inside your budget.",
    url: "/pip-calculator",
  },
};

/** Reference pip sizes, so the number the calculator uses is never a mystery. */
const PIP_REFERENCE = [
  { group: "Most major & cross pairs", example: "EUR/USD, GBP/USD, EUR/GBP", pip: "0.0001", lot: "100,000 units" },
  { group: "JPY quoted pairs", example: "USD/JPY, EUR/JPY, GBP/JPY", pip: "0.01", lot: "100,000 units" },
  { group: "Spot gold", example: "XAU/USD", pip: "0.01", lot: "100 oz" },
];

const STEPS = [
  {
    title: "Fix the risk first",
    body: "Decide what one idea is allowed to cost — a percentage of the balance, chosen before you look at the chart. One percent is a common starting point.",
  },
  {
    title: "Measure the invalidation",
    body: "Find the level that proves the trade wrong and count the distance to it in pips. That is your stop, not a number picked to make the size feel comfortable.",
  },
  {
    title: "Let the arithmetic decide the size",
    body: "Risk amount ÷ (stop in pips × pip value per lot) gives the position. If the answer feels too small, the stop is too wide or the account is too small — not the other way round.",
  },
];

export default async function PipCalculatorPage() {
  const rates = await getMarketRates();

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
            <nav
              aria-label="Breadcrumb"
              className="font-mona text-[13px] text-text"
            >
              <Link href="/" className="transition-colors hover:text-secondary">
                Home
              </Link>
              <span className="mx-2 text-primary/25">/</span>
              <span className="text-primary">Pip calculator</span>
            </nav>
          </Reveal>

          <div className="mx-auto max-w-[760px] text-center">
            <SectionHeading
              eyebrow="trader tools"
              className="!mb-6"
              title={
                <>
                  Size the trade before you <em>place</em> it
                </>
              }
            />
            <Reveal>
              <p className="font-mona text-[17px] leading-[178%] text-text">
                Set your balance, your risk and your stop distance, and the
                calculator returns the position size that keeps the loss inside
                the budget you chose. Works across majors, JPY crosses and spot
                gold. Free, and no sign-up.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The homepage section reused — one calculator, one behaviour. Its own
          heading is suppressed because the block above already introduced it. */}
      <PipCalculator
        heading={false}
        quoteToUsd={rates.quoteToUsd}
        asOf={rates.asOf}
      />

      {/* ── how it works ── */}
      <section className="bg-bg pb-20 lg:pb-[90px]">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <SectionHeading
              eyebrow="the working"
              title={
                <>
                  Three decisions, in <em>this order</em>
                </>
              }
            />
          </div>

          <Reveal stagger className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-[12px] border border-primary/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40"
              >
                <span className="gold-surface mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mona text-[14px] font-semibold text-primary">
                  {i + 1}
                </span>
                <h3 className="mb-2.5 font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  {step.title}
                </h3>
                <p className="font-mona text-[14.5px] leading-[172%] text-text">
                  {step.body}
                </p>
              </div>
            ))}
          </Reveal>

          {/* ── pip reference ── */}
          <Reveal className="mt-12 lg:mt-16">
            <div className="overflow-hidden rounded-[12px] border border-primary/10 bg-white">
              <div className="border-b border-primary/10 px-6 py-5 sm:px-8">
                <h3 className="font-mona text-[17px] font-medium tracking-[-0.02em] text-primary">
                  What counts as one pip
                </h3>
                <p className="mt-1 font-mona text-[13.5px] text-text">
                  The figure the calculator uses for each instrument.
                </p>
              </div>
              {/* Scrolls in its own container so the page body never does. */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="bg-bg">
                      {["Instrument group", "Examples", "One pip", "Standard lot"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-6 py-3.5 font-mona text-[11.5px] font-semibold tracking-[0.07em] text-text uppercase sm:px-8"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {PIP_REFERENCE.map((row) => (
                      <tr
                        key={row.group}
                        className="border-t border-primary/[0.07]"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-mona text-[14.5px] font-medium text-primary sm:px-8"
                        >
                          {row.group}
                        </th>
                        <td className="px-6 py-4 font-mona text-[14px] text-text sm:px-8">
                          {row.example}
                        </td>
                        <td className="px-6 py-4 font-mona text-[14px] font-medium tabular-nums text-secondary sm:px-8">
                          {row.pip}
                        </td>
                        <td className="px-6 py-4 font-mona text-[14px] tabular-nums text-text sm:px-8">
                          {row.lot}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                  The calculator gives you the number. The programme gives you
                  the plan.
                </h3>
                <p className="mx-auto mb-8 max-w-[480px] font-mona text-[14.5px] leading-[172%] text-white/55">
                  Every package is free while the desk is opening up — including
                  the risk framework this tool is built on.
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
