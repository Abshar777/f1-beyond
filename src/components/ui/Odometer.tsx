"use client";

import { useEffect, useRef } from "react";

type OdometerProps = {
  value: number;
  className?: string;
  /**
   * Odometer digit format, parsed by /^\(?([^)]*)\)?(?:(.)(d+))?$/.
   *
   * The leading group is greedy, so a decimal place only registers when the
   * repeating part is parenthesised: "(d).d" gives one decimal, "(,ddd).dd"
   * gives thousands separators plus two. Writing it as "d.d" looks right and
   * silently parses to precision 0 — 4.9 would render as 5.
   *
   * Empty string is treated as "d" (plain integer) by the library.
   */
  format?: string;
};

/**
 * Rolling-digit counter, matching the source template's Odometer.js behaviour:
 * each digit slides vertically on a ribbon over 2s once the number scrolls
 * fully into view, and animates only once.
 *
 * The library reads `document` at module scope and takes ownership of the DOM
 * node it is given, so it is imported lazily on the client and the span below
 * is left uncontrolled by React after init.
 */
export default function Odometer({
  value,
  className = "",
  format = "",
}: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guard against React 19 StrictMode's double effect invocation, which would
    // otherwise re-wrap a node the library has already transformed.
    if (el.dataset.odometerInitialized) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(value);
      return;
    }

    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    void import("odometer").then(({ default: OdometerLib }) => {
      if (cancelled || !ref.current) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer?.disconnect();
            if (el.dataset.odometerInitialized) return;
            el.dataset.odometerInitialized = "true";
            new OdometerLib({ el, value: 0, format, theme: "default" }).update(
              value,
            );
          }
        },
        { threshold: 1 },
      );

      observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [value, format]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
