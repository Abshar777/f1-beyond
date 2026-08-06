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
 * Scroll reveal: a clip wipe from the bottom edge paired with a rise and a
 * fractional scale-up, on a long `expo.out` tail so elements decelerate into
 * place instead of stopping dead.
 *
 * Deliberately no ScrollSmoother — smooth scrolling comes from Lenis, which is
 * synced to GSAP's ticker in SmoothScroll.
 */
export default function Reveal({
  children,
  className = "",
  stagger = false,
  y = 64,
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
          scale: 0.985,
          clipPath: "inset(0% 0% 12% 0%)",
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.35,
          delay,
          ease: SMOOTH,
          stagger: stagger ? { each: 0.085, ease: "power2.out" } : 0,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
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
