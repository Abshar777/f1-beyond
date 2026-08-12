"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MarketRates } from "@/lib/rates";
import CoinFallback from "@/components/three/CoinFallback";
import Odometer from "@/components/ui/Odometer";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/ui/TextReveal";

// WebGL can't render on the server, and pulling three into the server bundle
// would cost the whole page its static shell for one decorative canvas.
// `loading` keeps the column occupied while the 3D chunk streams in, so the
// hero doesn't reflow when it lands.
const CoinScene = dynamic(() => import("@/components/three/CoinScene"), {
  ssr: false,
  loading: () => <CoinFallback pulsing />,
});

/**
 * `count` drives the rolling Odometer; `suffix` is the literal that follows it
 * (a "k+" or a "/5"), kept out of the number so the digits roll on their own.
 * `format` is only needed where the value has a decimal.
 */
const STATS = [
  { count: 24, suffix: "k+", label: "Traders trained" },
  { count: 4.9, format: "(d).d", suffix: "/5", label: "Mentor rating" },
  { count: 12, suffix: "+", label: "Years in markets" },
];

const FEATURES = ["Live trading sessions", "Lifetime access", "Certification"];

/**
 * Hold the hero copy back by a second so it animates in *after* the preloader
 * has cleared rather than playing out behind it. Later elements are offset
 * from this so the badge → headline → body → stats order is preserved.
 */
const HERO_DELAY = 1;

/**
 * Hero — light/cream treatment with a 3D gold coin cluster.
 *
 * The header sits transparent over this section, so `Header` flips to its dark
 * logo and dark links while unscrolled; if this section's background ever goes
 * dark again, that needs flipping back or the nav disappears.
 */
export default function Hero2({
  /** Live metal quotes for the coin badges; forwarded straight to CoinScene. */
  metals,
}: {
  metals?: MarketRates["metals"];
}) {
  // Gate the 3D cluster on viewport rather than just hiding it with CSS: the
  // canvas is dynamically imported, so not rendering it means phones never
  // download three.js or pay the WebGL/GPU cost at all.
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setShowCoins(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <section className="relative z-1 overflow-hidden bg-bg pt-[104px] pb-16 sm:pt-[120px] lg:pt-[132px] lg:pb-28">
      {/* warm gold bloom, kept low-opacity so text contrast holds */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-18%] right-[-12%] -z-10 h-[760px] w-[760px] rounded-full opacity-[0.22] blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #09090b 1px, transparent 1px), linear-gradient(to bottom, #09090b 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 35%, transparent 100%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-10">
          {/* ── copy ── */}
          <div className="w-full lg:w-[52%]">
            <Reveal delay={HERO_DELAY} className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/10 bg-white/60 py-[3px] pr-[14px] pl-[3px] font-mona text-sm font-medium text-primary backdrop-blur-[8px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-[13px] py-[7px] font-mona text-sm font-medium text-primary">
                  <span className="relative inline-flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Live
                </span>
                Market sessions every week
              </div>
            </Reveal>

            <TextReveal delay={HERO_DELAY } className="mb-6">
              <h1 className="gold-accents gold-accents-deep font-mona text-[38px] leading-[1.04] font-medium tracking-[-0.03em] text-primary max-md:text-center md:text-[46px] lg:text-[52px] xl:text-[62px]">
                Trade crypto &amp; markets with real{" "}
                <em className="font-playfair font-normal italic">
                  strategy
                </em>
              </h1>
            </TextReveal>

            <Reveal delay={HERO_DELAY + 0.24}>
              <p className="mx-auto mb-9 max-w-[540px] text-base leading-[170%] text-text lg:mx-0">
                Learn from active traders through live market analysis, chart
                reading and practical risk management. Real charts, real
                strategies, real practice — walk in curious, walk out with a plan.
              </p>

              <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <ThemeButton href="/courses-v1" variant="secondary">
                  Start trading
                </ThemeButton>
                <ThemeButton href="/courses-v2" variant="outline">
                  View curriculum
                </ThemeButton>
              </div>

              <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
                {FEATURES.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-2 font-mona text-sm font-medium text-primary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal
              stagger
              delay={HERO_DELAY + 0.36}
              className="flex items-center justify-center gap-8 border-t border-primary/10 pt-7 lg:justify-start lg:gap-12"
            >
              {STATS.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="font-mona text-[26px] leading-none font-medium tracking-[-0.02em] text-primary xl:text-[32px]">
                    <Odometer value={s.count} format={s.format} />
                    {s.suffix}
                  </div>
                  <div className="mt-1.5 font-mona text-[13px] text-text">
                    {s.label}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          {/* ── 3D coins (desktop only) ── */}
          {showCoins && (
          <div className="w-full lg:w-[48%]">
            {/* overflow-hidden clips the drei <Html> price badges, which are
                positioned DOM siblings of the canvas and otherwise spill past
                the column edges */}
            <div className="relative mx-auto aspect-square w-full max-w-[420px] cursor-grab overflow-hidden select-none active:cursor-grabbing sm:max-w-[520px] lg:max-w-none">
              {/* soft floor shadow so the cluster sits in the page */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-[12%] left-1/2 h-[60px] w-[62%] -translate-x-1/2 rounded-[50%] bg-primary/15 blur-[38px]"
              />
              <CoinScene metals={metals} />
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
