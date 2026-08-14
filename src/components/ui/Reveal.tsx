"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SMOOTH } from "@/lib/ease";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Animate direct children individually with a stagger, instead of the whole block as one unit. */
  stagger?: boolean;
  y?: number;
  delay?: number;
};

/**
 * Scroll reveal — the single entrance animation used across every section.
 *
 * Three things run together, which is what separates this from a fade-up:
 *
 * 1. A full mask wipe. `clipPath` opens from a collapsed top edge to the whole
 *    box, so content is uncovered rather than faded in. The previous version
 *    only clipped the bottom 12%, which was too small to read as a mask at all
 *    and left the motion looking like a plain translate.
 * 2. A rise, so the content arrives into the opening mask instead of sitting
 *    still behind it.
 * 3. A scale settle from slightly *over* size down to 1 — the direction matters:
 *    easing outward to rest reads as the element coming to a stop, where the old
 *    zoom-in from 0.985 read as it being pushed.
 * All of it on one long `expo`-flavoured curve (see SMOOTH) so elements
 * decelerate for most of their travel instead of stopping dead.
 *
 * `clearProps` matters more than it looks: without it the tween leaves an inline
 * transform behind, and any CSS hover transform on the same element silently
 * stops working, because an inline style beats a utility class.
 *
 * Deliberately no ScrollSmoother — smooth scrolling comes from Lenis, which is
 * synced to GSAP's ticker in SmoothScroll, so ScrollTrigger and Lenis share one
 * clock.
 */
export default function Reveal({
  children,
  className = "",
  stagger = false,
  y = 72,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = stagger
        ? gsap.utils.toArray<HTMLElement>(ref.current.children)
        : ref.current;

      gsap.fromTo(
        targets,
        {
          y,
          opacity: 0,
          scale: 1.03,
          clipPath: "inset(0% 0% 100% 0%)",
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          delay,
          ease: SMOOTH,
          // `amount` fixes the total spread rather than the gap between items,
          // so a 3-card row and an 8-card grid take the same time to land.
          //
          // Kept deliberately short. Spread and duration add up: at 0.5s spread
          // over a 1.5s tween the last card in a grid took two full seconds to
          // arrive, which read as the cards lagging behind the scroll rather
          // than responding to it.
          stagger: stagger ? { amount: 0.3, ease: "power2.out" } : 0,
          clearProps: "all",
          scrollTrigger: {
            trigger: ref.current,
            // Fires as the block edges into view rather than a fifth of the way
            // up the viewport, so the motion is already underway by the time it
            // is properly in frame.
            start: "top 92%",
            once: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
