"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { SMOOTH } from "@/lib/ease";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Split to words instead of lines — for short labels where line-splitting has nothing to do. */
  words?: boolean;
};

/**
 * Masked line reveal. Each line sits in its own overflow-clipped wrapper and
 * rises from exactly the mask edge while a slight 3D tilt flattens out, so the
 * text reads as swinging up into place rather than sliding on a flat plane.
 *
 * `autoSplit` re-splits on font load and resize — without it, lines are
 * measured against the fallback font and break in the wrong places.
 */
export default function TextReveal({
  children,
  className = "",
  delay = 0,
  words = false,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Split the heading itself when this only wraps one element, so the
      // generated line wrappers inherit its type styles rather than the div's.
      const target =
        el.children.length === 1 && el.firstElementChild
          ? (el.firstElementChild as HTMLElement)
          : el;

      const type = words ? "words" : "lines";

      const split = SplitText.create(target, {
        type,
        mask: type,
        autoSplit: true,
        onSplit(self) {
          const parts = words ? self.words : self.lines;

          // Depth only reads as depth with a perspective ancestor; without it
          // rotationX collapses to a vertical squash.
          gsap.set(target, { perspective: 800 });

          return gsap.from(parts, {
            yPercent: 100,
            rotateX: -38,
            transformOrigin: "50% 100% -40px",
            opacity: 0,
            duration: 1.45,
            delay,
            ease: SMOOTH,
            // easing the stagger itself keeps later lines from arriving in a
            // mechanical, evenly-spaced march
            stagger: { each: words ? 0.05 : 0.1, ease: "power2.out" },
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
