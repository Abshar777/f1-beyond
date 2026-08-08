"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { SMOOTH } from "@/lib/ease";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Testimonial = {
  id: string;
  initial: string;
  name: string;
  role: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "emily-e-carter",
    initial: "E",
    name: "Emily E. Carter",
    role: "Forex · 2 years trading",
    quote:
      "I could read a candle and nothing else when I started. The risk rules alone changed how I size every trade — I stopped blowing up accounts by month two.",
  },
  {
    id: "eleanor-e-pena",
    initial: "E",
    name: "Eleanor E. Pena",
    role: "Crypto · 1 year trading",
    quote:
      "The live sessions are the difference. Watching a mentor talk through an entry in real time, on a real chart, beats any recorded course I have bought.",
  },
  {
    id: "marcus-hale",
    initial: "M",
    name: "Marcus Hale",
    role: "Indices · 8 months trading",
    quote:
      "What sold me was being told to stop trading for two weeks and just journal setups. Nobody selling signals tells you that. My win rate went up when I traded less.",
  },
  {
    id: "priya-raghavan",
    initial: "P",
    name: "Priya Raghavan",
    role: "Commodities · 3 years trading",
    quote:
      "I came in already profitable and still got value. The position-sizing framework replaced the gut-feel approach I had been getting away with for two years.",
  },
  {
    id: "daniel-okoro",
    initial: "D",
    name: "Daniel Okoro",
    role: "Forex · 1 year trading",
    quote:
      "The psychology track is the part I did not think I needed. Turns out my problem was never the strategy — it was moving my stop after I was already wrong.",
  },
  {
    id: "sofia-marchetti",
    initial: "S",
    name: "Sofia Marchetti",
    role: "Crypto & metals · 6 months trading",
    quote:
      "I finished with a written plan I actually follow, and a mentor who reviewed it line by line. That review was worth more than the rest of the course combined.",
  },
];

/**
 * The list is rendered twice. Advancing past the last real card lands on its
 * duplicate, which is pixel-identical, so rewinding the scroll by one full set
 * at that moment is invisible — that is what makes the loop seamless instead of
 * snapping back to the start.
 */
const SLIDES = [...TESTIMONIALS, ...TESTIMONIALS];

const TOTAL = TESTIMONIALS.length;
const GAP = 24;
const INTERVAL_MS = 4500;
/** How long a smooth scroll is given to settle before the loop is normalised. */
const SETTLE_MS = 700;
/** Matches the container's own max width, so the cards line up with every other section. */
const CONTAINER_MAX = 1320;

function getCardWidth() {
  if (typeof window === "undefined") return 560;
  return window.innerWidth < 768 ? window.innerWidth - 48 : 560;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const STAR_PATH =
  "M2.55 12.6667L3.63333 7.98333L0 4.83333L4.8 4.41667L6.66667 0L8.53333 4.41667L13.3333 4.83333L9.7 7.98333L10.7833 12.6667L6.66667 10.1833L2.55 12.6667Z";

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          width="13"
          height="12"
          viewBox="0 0 14 13"
          fill="none"
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill="#d4af37" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Google's four-colour mark, left in its brand colours — recolouring it to gold
 * to match the palette would misrepresent the logo.
 */
function GoogleMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const ARROW_CLASSES =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary/15 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-secondary hover:text-white";

/**
 * Trader stories — an edge-bleeding horizontal scroller that loops.
 *
 * Ported from the trading-hub's TestimonialsSection for its interaction rather
 * than its styling: cards run off the right edge so the row reads as continuing,
 * only the active card is at full opacity, and the pagination is a segmented
 * progress bar with a position counter instead of dots. Replaces the Swiper
 * carousel that was here, along with its per-card photo, brand logo and avatar
 * stack.
 *
 * Typography goes through our own SectionHeading, deliberately. Copying the
 * source's scale verbatim is what made an earlier ported section read as a
 * foreign block dropped into the page; only the layout and behaviour are
 * borrowed, the type and palette are ours.
 *
 * Scrolling is native `overflow-x-auto`, not a transform track — that keeps
 * touch and trackpad dragging free, and the active index is derived back out of
 * `scrollLeft`. `isAutoRef` gates that derivation while a programmatic scroll is
 * in flight, otherwise the smooth scroll's own intermediate positions fight the
 * index it is trying to reach.
 */
export default function Testimonials() {
  const [cardW, setCardW] = useState(560);
  const [activeIdx, setActiveIdx] = useState(0);
  /** Absolute slide position across both copies, mirrored into state so the
   *  rendered cards know which single slide is the live one. */
  const [pos, setPos] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef(0);
  /** True while a programmatic scroll plays, so onScroll ignores it. */
  const isAutoRef = useRef(false);

  const step = cardW + GAP;

  useEffect(() => {
    const update = () => setCardW(getCardWidth());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  // Re-anchor after a resize changes the card width, or the scroller ends up
  // parked between two cards.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      left: posRef.current * step,
      behavior: "auto",
    });
  }, [step]);

  const setPosition = useCallback((next: number) => {
    posRef.current = next;
    setPos(next);
    setActiveIdx(((next % TOTAL) + TOTAL) % TOTAL);
  }, []);

  const goTo = useCallback(
    (target: number, smooth = true) => {
      const el = scrollRef.current;
      if (!el) return;

      isAutoRef.current = true;
      setPosition(target);
      el.scrollTo({
        left: target * step,
        behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      });

      if (settleRef.current) clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        // Walked into the duplicate half — rewind a whole set. The card under
        // the viewport is the same one, so nothing visibly moves.
        if (posRef.current >= TOTAL) {
          setPosition(posRef.current - TOTAL);
          el.scrollTo({ left: posRef.current * step, behavior: "auto" });
        }
        isAutoRef.current = false;
      }, SETTLE_MS);
    },
    [step, setPosition],
  );

  const next = useCallback(() => goTo(posRef.current + 1), [goTo]);

  const prev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // At the very start there is nothing to the left, so hop forward one whole
    // set first — the same card, the other copy — then walk back into it.
    if (posRef.current <= 0) {
      setPosition(TOTAL);
      el.scrollTo({ left: TOTAL * step, behavior: "auto" });
    }
    goTo(posRef.current - 1);
  }, [goTo, step, setPosition]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (restartRef.current) clearTimeout(restartRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    // An auto-advancing carousel is motion the reader did not ask for; leave it
    // parked and fully manual when reduced motion is requested.
    if (prefersReducedMotion()) return;
    stopTimer();
    timerRef.current = setInterval(next, INTERVAL_MS);
  }, [next, stopTimer]);

  // Only advance while the section is actually on screen. Running from mount
  // meant a reader who took ten seconds to scroll here arrived at card 3 of 6,
  // with the entrance stagger animating cards already scrolled off to the left.
  // An IntersectionObserver rather than a ScrollTrigger on purpose: the timer
  // callbacks change identity whenever the card width does, and re-running the
  // GSAP context on that would revert and replay the entrance on every resize.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startTimer() : stopTimer()),
      { threshold: 0.2 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stopTimer();
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, [startTimer, stopTimer]);

  // Cards rise in one at a time, matching the pricing grid. Wrapping the whole
  // scroller in <Reveal> animated it as a single block, which is what made this
  // look like a default scroll-in rather than a staggered entrance.
  //
  // `from` with opacity resolves its end value from whatever the card currently
  // computes to — 1 for the active card, 0.4 for the dimmed ones — so each fades
  // to its correct resting state instead of all landing opaque. clearProps then
  // hands opacity back to the Tailwind classes, so the active/inactive dim keeps
  // working for the rest of the session; without it the inline opacity would win
  // forever and every card would stay lit.
  useGSAP(
    () => {
      if (!trackRef.current) return;
      if (prefersReducedMotion()) return;

      gsap.from(gsap.utils.toArray<HTMLElement>("figure", trackRef.current), {
        y: 56,
        opacity: 0,
        scale: 0.97,
        duration: 0.85,
        // `amount` bounds the total spread, so rendering the list twice for the
        // loop does not double how long the entrance takes.
        stagger: { amount: 0.4 },
        ease: SMOOTH,
        clearProps: "all",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  const handleScroll = useCallback(() => {
    if (isAutoRef.current || !scrollRef.current) return;
    const derived = Math.min(
      Math.max(Math.round(scrollRef.current.scrollLeft / step), 0),
      SLIDES.length - 1,
    );
    setPosition(derived);
    // Hand control back to the timer once the reader has settled.
    if (restartRef.current) clearTimeout(restartRef.current);
    restartRef.current = setTimeout(startTimer, 2000);
  }, [step, startTimer, setPosition]);

  return (
    <section
      ref={sectionRef}
      id="stories"
      className="relative z-[1] overflow-hidden bg-bg py-20 xl:py-[90px] 2xl:py-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal y={24} className="mb-6">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mona text-[15px] font-medium text-primary">
              4.9 out of 5
            </span>
            <Stars />
            <GoogleMark size={17} />
            <span className="font-mona text-[15px] text-text">
              Google Reviews · 1,200+ verified
            </span>
          </div>
        </Reveal>

        <SectionHeading
          align="left"
          eyebrow="trader stories"
          title={
            <>
              Trusted by traders
              building <em>real skill</em>
            </>
          }
        />
      </div>

      {/* ── Carousel ──
          Padding is derived from the container rather than a fixed inset, so the
          first card starts exactly where the heading does at every width while
          the last one still runs off the right edge. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          ref={trackRef}
          className="flex [--edge:1rem] sm:[--edge:1.5rem] lg:[--edge:2rem]"
          style={{
            paddingLeft: `max(var(--edge), calc((100% - ${CONTAINER_MAX}px) / 2 + var(--edge)))`,
            paddingRight: `max(var(--edge), calc((100% - ${CONTAINER_MAX}px) / 2 + var(--edge)))`,
            gap: `${GAP}px`,
          }}
        >
          {SLIDES.map((item, i) => (
            <figure
              // The second copy repeats every id, so the index has to be part of
              // the key.
              key={`${item.id}-${i}`}
              className={`flex flex-shrink-0 flex-col rounded-[12px] border bg-white p-8 transition-[opacity,border-color,box-shadow] duration-500 max-md:p-6 ${
                i === pos
                  ? "border-secondary/40 opacity-100 shadow-[0_24px_60px_-45px_rgba(9,9,11,0.5)]"
                  : "border-primary/10 opacity-40"
              }`}
              style={{
                width: `${cardW}px`,
                minHeight: cardW < 400 ? 280 : 300,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <Stars />
                <GoogleMark />
              </div>

              <blockquote className="mt-5 mb-7 flex-1 font-mona text-[15.5px] leading-[165%] text-primary max-md:text-[14.5px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <figcaption className="flex items-center gap-3 border-t border-primary/10 pt-5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-mona text-[14px] font-medium text-secondary uppercase"
                >
                  {item.initial}
                </span>
                <span className="block">
                  <span className="block font-mona text-[13.5px] leading-tight font-medium text-primary">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block font-mona text-[11.5px] leading-snug text-text">
                    {item.role} · Verified Google review
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* ── Pagination ── segmented bar sized to one card so it reads as a
          progress track for the row, plus manual step controls. */}
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal y={20} className="mt-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="flex min-w-0 flex-1 items-center gap-[6px] sm:flex-none"
              style={{ width: `${cardW}px` }}
            >
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    goTo(i);
                    startTimer();
                  }}
                  aria-label={`Show review ${i + 1} of ${TOTAL}, ${item.name}`}
                  aria-current={i === activeIdx}
                  className={`h-[3px] flex-1 cursor-pointer rounded-full transition-colors duration-300 ${
                    i === activeIdx ? "bg-secondary" : "bg-primary/15"
                  }`}
                />
              ))}
            </div>

            <span className="font-mona text-[13px] tabular-nums whitespace-nowrap text-text">
              {activeIdx + 1} / {TOTAL}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  prev();
                  startTimer();
                }}
                aria-label="Previous review"
                className={ARROW_CLASSES}
              >
                <ArrowLeft size={15} strokeWidth={2.2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  next();
                  startTimer();
                }}
                aria-label="Next review"
                className={ARROW_CLASSES}
              >
                <ArrowRight size={15} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
