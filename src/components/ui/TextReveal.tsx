"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { SMOOTH } from "@/lib/ease";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type SplitBy = "chars" | "words" | "lines";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Granularity of the reveal. Defaults to per-letter. */
  splitBy?: SplitBy;
};

/**
 * Masked text reveal. The split is always nested down to lines so each line
 * gets its own overflow-clipped wrapper; the animated units (letters by
 * default) then rise from exactly that mask edge while a 3D tilt flattens
 * out, so type swings up into place rather than sliding on a flat plane.
 *
 * `autoSplit` re-splits on font load and resize — without it, lines are
 * measured against the fallback font and break in the wrong places.
 */
export default function TextReveal({
  children,
  className = "",
  delay = 0,
  splitBy = "chars",
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Split the heading itself when this only wraps one element, so the
      // generated wrappers inherit its type styles rather than the div's.
      const target =
        el.children.length === 1 && el.firstElementChild
          ? (el.firstElementChild as HTMLElement)
          : el;

      // Always split down to lines so the mask has something to clip against,
      // even when the animated unit is a letter.
      const type =
        splitBy === "chars"
          ? "lines,words,chars"
          : splitBy === "words"
            ? "lines,words"
            : "lines";

      const split = SplitText.create(target, {
        type,
        mask: "lines",
        autoSplit: true,
        // keeps the original string on the container for screen readers
        // instead of exposing a pile of single-letter nodes
        aria: "auto",
        onSplit(self) {
          const parts =
            splitBy === "chars"
              ? self.chars
              : splitBy === "words"
                ? self.words
                : self.lines;

          // Depth only reads as depth with a perspective ancestor; without it
          // rotationX collapses to a vertical squash.
          gsap.set(target, { perspective: 800 });

          // Per-letter counts vary wildly between headings, so spread the
          // stagger over a fixed *total* rather than a fixed per-item delay —
          // `each` would make a long headline crawl and a short one snap.
          const spread =
            splitBy === "chars" ? 0.55 : splitBy === "words" ? 0.4 : 0.3;

          return gsap.from(parts, {
            yPercent: 110,
            rotateX: splitBy === "chars" ? -50 : -38,
            transformOrigin: "50% 100% -30px",
            opacity: 0,
            duration: splitBy === "chars" ? 0.85 : 1.45,
            delay,
            ease: SMOOTH,
            stagger: { amount: spread, from: "start", ease: "power2.out" },
            scrollTrigger: {
              trigger: target,
              start: "top 88%",
              once: true,
            },
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
