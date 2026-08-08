"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/contact";

/** How long the label stays out, and how long it stays away. */
const LABEL_VISIBLE_MS = 3400;
const LABEL_HIDDEN_MS = 6600;
const FIRST_SHOW_MS = 2500;

/** Standard WhatsApp glyph, 24x24. */
function WhatsAppGlyph() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.371-.03-.52-.087-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/**
 * Floating WhatsApp CTA, bottom-right.
 *
 * The label's open/closed state is React state on a timer, not a CSS keyframe
 * animation. It used to be `.fab-label` cycling on a 9s `@keyframes` with hover
 * setting `animation: none` — which is exactly why hovering was not smooth:
 * killing the animation snapped the element back to its base `max-width: 0`
 * before any transition could start, so a label caught half-open jumped shut and
 * then grew again. One boolean driving one CSS transition means the interval and
 * the hover share the same easing and interrupt each other cleanly both ways.
 *
 * No border and no hover gradient: the disc and its halo carry the affordance,
 * and the pill is just a surface for the label to sit on.
 */
export default function WhatsAppButton() {
  const [cycleOpen, setCycleOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer: ReturnType<typeof setTimeout>;
    const step = (open: boolean) => {
      setCycleOpen(open);
      // Reduced motion opens the label once and stops there rather than
      // pulsing it in and out.
      if (reduce) return;
      timer = setTimeout(
        () => step(!open),
        open ? LABEL_VISIBLE_MS : LABEL_HIDDEN_MS,
      );
    };

    // Always scheduled, never called straight from the effect body — a
    // synchronous setState here would trigger a cascading render, and doing it
    // from a lazy initialiser instead would need `window` during SSR and
    // hydrate to a different value for reduced-motion readers.
    timer = setTimeout(() => step(true), reduce ? 0 : FIRST_SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  const open = cycleOpen || hovered;

  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Talk to our team on WhatsApp"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="fixed right-5 bottom-5 z-[999] flex items-center rounded-full bg-primary/95 p-1.5 shadow-[0_12px_34px_-10px_rgba(0,0,0,0.55)] backdrop-blur-md transition-transform duration-300 ease-out hover:-translate-y-1 sm:right-[30px] sm:bottom-[30px]"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        {/* Painted before the disc, so the halo sits behind it. */}
        <span
          aria-hidden
          className="fab-ring absolute inset-0 rounded-full bg-[#25d366]"
        />
        <span className="wa-disc relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white">
          <WhatsAppGlyph />
        </span>
      </span>

      {/* aria-hidden because the link already carries the accessible name;
          without it a screen reader announces the label twice.

          max-width rather than width, because the copy has no fixed length — and
          the padding animates with it so the collapsed state leaves no stub of
          gutter beside the disc. */}
      <span
        aria-hidden
        className={`overflow-hidden whitespace-nowrap transition-all duration-[450ms] ease-out ${
          open
            ? "max-w-[210px] pr-3.5 pl-3 opacity-100"
            : "max-w-0 pr-0 pl-0 opacity-0"
        }`}
      >
        <span className="block font-mona text-[13.5px] leading-tight font-medium text-white">
          Talk to our team
        </span>
        <span className="mt-[3px] block font-mona text-[11px] leading-tight text-[#4fd97f]">
          Typically replies in minutes
        </span>
      </span>
    </a>
  );
}
