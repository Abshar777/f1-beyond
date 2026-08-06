"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Drift in px across the full scroll pass. Negative moves against the scroll. */
  distance?: number;
};

/**
 * Scrubbed parallax drift. The `scrub` value lags the tween slightly behind the
 * scroll position, which is what stops it reading as a rigid 1:1 transform.
 */
export default function Parallax({
  children,
  className = "",
  distance = 90,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ref.current,
        { y: distance * -0.5 },
        {
          y: distance * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
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
