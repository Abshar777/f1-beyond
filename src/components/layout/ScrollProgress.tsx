"use client";

import { useCallback, useEffect, useState } from "react";

const RADIUS = 49;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHOW_AFTER_PX = 50;

/**
 * Fixed bottom-right "back to top" button whose ring fills in as the page
 * scrolls, matching the original template's `.progress-wrap` /
 * `.progress-circle` markup and behavior. Hidden near the top of the page,
 * scrolls smoothly to top on click.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, pct)));
      setActive(scrollTop > SHOW_AFTER_PX);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`group fixed right-[20px] bottom-[20px] z-[999] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-[15px] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[5px] hover:scale-110 hover:border-primary hover:bg-white/20 hover:shadow-[0_15px_40px_rgba(216,120,39,0.25)] sm:right-[30px] sm:bottom-[30px] sm:h-[50px] sm:w-[50px] ${
        active
          ? "visible translate-y-0 scale-100 opacity-100"
          : "invisible pointer-events-none translate-y-[20px] scale-[0.8] opacity-0"
      }`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="-1 -1 102 102"
      >
        <path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          fill="none"
          strokeWidth={4}
          strokeOpacity={0.6}
          className="stroke-primary transition-all duration-200 ease-linear group-hover:[stroke-opacity:1]"
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-[1] h-[18px] w-[18px] text-primary transition-transform duration-300 group-hover:-translate-y-[2px]"
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}
