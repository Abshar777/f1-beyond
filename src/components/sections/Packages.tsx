"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Minus } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import { SMOOTH } from "@/lib/ease";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Feature = { label: string; included: boolean };

type Tier = {
  id: string;
  name: string;
  tagline: string;
  /** Always "Free" while the launch offer runs; the banner states the offer. */
  priceLabel: string;
  /** What the tier normally costs, struck through beside the free price. */
  was?: string;
  save?: string;
  cadence: string;
  cta: string;
  href: string;
  badge?: string;
  featured?: boolean;
  features: Feature[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline:
      "Find your feet in the market — charts, terms and the habits that keep an account alive.",
    priceLabel: "Free",
    cadence: "Free forever · no card needed",
    cta: "Start free",
    href: "#contact",
    features: [
      { label: "Charting foundations — 12 lessons", included: true },
      { label: "Weekly market recap", included: true },
      { label: "Community trading floor", included: true },
      { label: "Risk-management workbook", included: true },
      { label: "Live mentor desk sessions", included: false },
      { label: "One-to-one strategy review", included: false },
      { label: "Certification", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Trader",
    badge: "Most popular",
    featured: true,
    tagline:
      "The full programme. Live desks, real position sizing, and a written plan you have actually tested.",
    priceLabel: "Free",
    was: "$256",
    save: "Save $256",
    cadence: "Free right now · lifetime access",
    cta: "Enroll now",
    href: "#contact",
    features: [
      { label: "Everything in Starter", included: true },
      { label: "42 lessons across 6 modules", included: true },
      { label: "Live mentor desk, twice weekly", included: true },
      { label: "One-to-one strategy review", included: true },
      { label: "Trading-psychology track", included: true },
      { label: "Private mentor channel", included: true },
      { label: "Certification", included: true },
    ],
  },
  {
    id: "desk",
    name: "Institutional",
    tagline:
      "For prop desks and teams who want the programme delivered in-house, against their own mandate.",
    priceLabel: "Free",
    was: "Custom quote",
    cadence: "Free pilot · normally quoted per desk",
    cta: "Contact sales",
    href: "#contact",
    features: [
      { label: "Everything in Pro Trader", included: true },
      { label: "Curriculum mapped to your mandate", included: true },
      { label: "On-site or private cohort", included: true },
      { label: "Desk-wide risk framework", included: true },
      { label: "Dedicated mentor retainer", included: true },
      { label: "Progress reporting for leads", included: true },
      { label: "Team certification", included: true },
    ],
  },
];

function FeatureRow({
  feature,
  dark,
}: {
  feature: Feature;
  dark: boolean;
}) {
  const { label, included } = feature;
  return (
    <li
      data-feature
      className={`flex items-start gap-3 py-[9px] font-mona text-[14.5px] leading-[150%] ${
        included
          ? dark
            ? "text-white/80"
            : "text-primary/85"
          : dark
            ? "text-white/30"
            : "text-text/55"
      }`}
    >
      <span
        className={`mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          included
            ? "bg-secondary/15 text-secondary"
            : dark
              ? "bg-white/[0.06] text-white/30"
              : "bg-primary/[0.06] text-text/45"
        }`}
      >
        {included ? (
          <Check size={11} strokeWidth={3} aria-hidden />
        ) : (
          <Minus size={11} strokeWidth={3} aria-hidden />
        )}
      </span>
      {/* The icon alone carries the include/exclude meaning visually, so the
          state is spelled out for screen readers rather than left to colour. */}
      <span className="sr-only">{included ? "Included: " : "Not included: "}</span>
      <span className={included ? "" : "line-through decoration-1"}>{label}</span>
    </li>
  );
}

function PricingCard({ tier }: { tier: Tier }) {
  const dark = Boolean(tier.featured);

  return (
    <div
      className={`pricing-card group relative flex h-full flex-col overflow-hidden rounded-[12px] border transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 ${
        dark
          ? "border-secondary/30 bg-primary shadow-[0_24px_70px_-40px_rgba(212,175,55,0.5)] hover:border-secondary/60"
          : "border-primary/10 bg-white hover:border-secondary/40 hover:shadow-[0_24px_60px_-45px_rgba(9,9,11,0.55)]"
      }`}
    >
      {/* Gold hairline across the top of the featured card — the cheapest way
          to draw the eye to it before any copy is read. */}
      {dark && (
        <span
          aria-hidden
          className="gold-surface absolute inset-x-0 top-0 h-[3px] bg-secondary"
        />
      )}

      <div
        className="relative flex h-full flex-col p-7 sm:p-8 xl:p-9"
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3
            className={`font-mona text-[19px] font-medium tracking-[-0.02em] ${
              dark ? "text-white" : "text-primary"
            }`}
          >
            {tier.name}
          </h3>
          {tier.badge && (
            <span className="gold-surface shrink-0 rounded-full bg-secondary px-2.5 py-1 font-mona text-[11px] font-semibold tracking-[0.04em] text-primary uppercase">
              {tier.badge}
            </span>
          )}
        </div>

        <p
          className={`mb-7 font-mona text-[14px] leading-[165%] md:min-h-[70px] ${
            dark ? "text-white/50" : "text-text"
          }`}
        >
          {tier.tagline}
        </p>

        {/* ── price ── */}
        <div className="mb-1.5 flex items-end gap-2.5">
          <span
            className={`font-mona text-[46px] leading-none font-medium tracking-[-0.04em] lg:text-[54px] ${
              dark ? "gold-shine" : "text-primary"
            }`}
          >
            {tier.priceLabel}
          </span>

          {tier.was && (
            <span className="mb-1.5 flex items-center gap-2">
              <span
                className={`font-mona text-[15px] line-through ${dark ? "text-white/35" : "text-text"}`}
              >
                {tier.was}
              </span>
              {tier.save && (
                <span className="rounded bg-secondary/15 px-1.5 py-0.5 font-mona text-[11px] font-semibold text-secondary">
                  {tier.save}
                </span>
              )}
            </span>
          )}
        </div>

        <p
          className={`mb-7 font-mona text-[13px] ${
            dark ? "text-white/40" : "text-text"
          }`}
        >
          {tier.cadence}
        </p>

        <ThemeButton
          href={tier.href}
          variant={dark ? "secondary" : "outline"}
          className="!w-full !justify-between"
        >
          {tier.cta}
        </ThemeButton>

        <div
          className={`mt-8 mb-4 border-t pt-1 ${
            dark ? "border-white/[0.09]" : "border-primary/10"
          }`}
        >
          <span
            className={`font-mona text-[11px] font-semibold tracking-[0.09em] uppercase ${
              dark ? "text-white/35" : "text-text"
            }`}
          >
            What&apos;s included
          </span>
        </div>

        <ul className="mt-auto">
          {tier.features.map((feature) => (
            <FeatureRow key={feature.label} feature={feature} dark={dark} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Packages — a straight three-tier pricing section.
 *
 * Replaces the template's course-listing grid (thumbnail + rating + lesson
 * counts), which was never a pricing table and carried a background photo. No
 * imagery here at all: the hierarchy is done with the dark featured card, its
 * gold hairline and the badge, so nothing depends on an asset loading.
 *
 * Every tier is free while the launch offer runs, so each one shows "Free"
 * against its struck-through normal price rather than a number — there is
 * nothing left to count up, and the section banner states the offer outright so
 * it does not have to be inferred from three identical prices.
 *
 * Motion is one staggered timeline rather than a single block reveal: the cards
 * rise straight up from below one after another, and each one's feature rows
 * are pinned to the moment that card starts moving.
 */
export default function Packages() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        ".pricing-card",
        gridRef.current,
      );

      // One timeline on the grid, not a trigger per card. A per-card trigger
      // fires all three at once on a desktop row, so the "stagger" had to be
      // faked with an index delay; driving them from a single stagger makes the
      // order real and keeps the follow-on beats locked to it.
      const CARD_STEP = 0.09;
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: gridRef.current, start: "top 90%", once: true },
      });

      // Straight rise, no tilt. An earlier pass added rotateX under
      // perspective, which skewed each card into a trapezoid for the whole
      // flight — the distortion read as a rendering fault rather than motion.
      timeline.from(cards, {
        y: 64,
        opacity: 0,
        duration: 0.85,
        stagger: CARD_STEP,
        ease: SMOOTH,
        clearProps: "all",
      });

      cards.forEach((card, i) => {
        // Offset each card's own beats to the moment that card starts rising.
        const at = i * CARD_STEP + 0.18;

        timeline.from(
          card.querySelectorAll("[data-feature]"),
          {
            y: 14,
            opacity: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: SMOOTH,
            clearProps: "all",
          },
          at,
        );

      });
    },
    { scope: gridRef },
  );

  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-bg py-20 lg:py-[90px] 2xl:py-[130px]"
    >
      {/* Image-free backdrop: a gold bloom plus the hero's masked grid, so the
          section has depth without shipping a photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-14%] left-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[150px]"
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
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[880px]">
          <SectionHeading
            eyebrow="mentorship packages"
            align="center"
            title={
              <>
                Every package is <em>completely free</em>{" "}
                while the desk is opening up
              </>
            }
            className="!mb-8"
          />

          {/* States the offer outright. With all three tiers showing "Free",
              the prices alone read as a mistake rather than a promotion. */}
          {/* Desktop only — on a phone this stacks into four lines of
              small print above the cards, which already each say "Free". */}
          <div className="mb-10 hidden justify-center md:flex lg:mb-14">
            <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-secondary/30 bg-white px-4 py-2 text-center font-mona text-[13.5px] text-primary">
              <span className="gold-surface rounded-full bg-secondary px-2 py-[3px] font-mona text-[11px] font-semibold tracking-[0.05em] text-primary uppercase">
                100% free
              </span>
              All three packages are free right now — full access, no card, no
              trial, nothing to cancel.
            </p>
          </div>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        <p className="mt-10 text-center font-mona text-[13px] text-text">
          Every package includes the pip calculator and the risk workbook. The
          struck-through figures are what these normally cost — you pay none of
          it while the launch offer runs.
        </p>
      </div>
    </section>
  );
}
