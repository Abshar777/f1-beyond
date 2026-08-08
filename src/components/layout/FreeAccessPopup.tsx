"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, X } from "lucide-react";
import { CONTACT_MODAL_OPEN_EVENT } from "@/lib/contact-modal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DISMISS_KEY = "beyondpips:free-popup-dismissed";

/** Instant exit. Used when the contact modal opens: a tween would leave the
 *  toast on screen for its duration, and it has no business animating out from
 *  underneath a dialog that is animating in over it. `set` also applies
 *  synchronously, so it does not depend on the ticker running. */
function hideNow(el: Element | null) {
  gsap.set(el, { autoAlpha: 0 });
}

/** Animated exit, used by the close button and the auto-retire. */
function hide(el: Element | null) {
  gsap.to(el, {
    autoAlpha: 0,
    y: 14,
    scale: 0.94,
    duration: 0.35,
    ease: "power2.in",
  });
}

/**
 * Small floating notice announcing that every package is currently free.
 *
 * Pops in on a ScrollTrigger tied to the packages section rather than on a
 * timer, so it arrives exactly when pricing becomes relevant instead of
 * interrupting the hero. Anchored bottom-left, the opposite corner to the
 * back-to-top button, so the two can never collide. Once dismissed it stays
 * gone for the rest of the session — a promo that reappears on every scroll is
 * an irritation, not a hook.
 *
 * Visibility is handled entirely by GSAP's `autoAlpha` (opacity + visibility),
 * which is why no React state is involved: the hidden state is also the
 * non-interactive state, so there is nothing to keep in sync. The initial
 * `invisible` class stops it flashing before the tween is built.
 */
export default function FreeAccessPopup() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      // Already dismissed this session: leave it in its hidden initial state.
      if (sessionStorage.getItem(DISMISS_KEY)) return;

      const trigger = document.getElementById("packages");
      if (!trigger) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      gsap.set(el, { autoAlpha: 0, y: 26, scale: 0.86 });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: reduce ? 0.01 : 0.75,
        // Slight overshoot — this is the one element on the page that should
        // feel like it popped rather than eased.
        ease: reduce ? "none" : "back.out(1.7)",
        scrollTrigger: { trigger, start: "top bottom", once: true },
        // Retire on its own. Being fixed, it necessarily covers part of the
        // pricing grid it is advertising, so it says its piece and leaves
        // rather than sitting over the third card for the rest of the visit.
        // Cancelled the moment the pointer arrives, so it never vanishes from
        // under someone reaching for the button.
        onComplete: () => {
          const retire = gsap.delayedCall(9, () => hide(el));
          el.addEventListener("pointerenter", () => retire.kill(), {
            once: true,
          });
        },
      });
    },
    { scope: ref },
  );

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    hide(ref.current);
  };

  // The contact modal covers the page; leaving this toast underneath its
  // backdrop just puts a dimmed second promo behind the dialog.
  useEffect(() => {
    const onModalOpen = () => hideNow(ref.current);
    window.addEventListener(CONTACT_MODAL_OPEN_EVENT, onModalOpen);
    return () => window.removeEventListener(CONTACT_MODAL_OPEN_EVENT, onModalOpen);
  }, []);

  return (
    <aside
      ref={ref}
      aria-label="Limited-time offer"
      className="invisible fixed bottom-5 left-5 z-[998] w-[262px] rounded-[10px] border border-secondary/35 bg-primary p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] sm:bottom-[30px] sm:left-[30px] sm:w-[286px]"
    >
      {/* corner bloom, inside the rounded clip */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[10px]"
        style={{
          background:
            "radial-gradient(90% 90% at 90% 4%, rgba(212,175,55,0.2), transparent 62%)",
        }}
      />

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss offer"
        className="absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        <X size={13} strokeWidth={2.6} aria-hidden />
      </button>

      <div className="relative">
        <span className="gold-surface mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-[3px] font-mona text-[10.5px] font-semibold tracking-[0.06em] text-primary uppercase">
          <Sparkles size={11} strokeWidth={2.6} aria-hidden />
          100% free
        </span>

        <p className="mb-1 pr-5 font-mona text-[14.5px] leading-[135%] font-medium text-white">
          Every package is free right now
        </p>
        <p className="mb-3.5 font-mona text-[12.5px] leading-[150%] text-white/50">
          Full access to all three tiers — no card, no trial.
        </p>

        <Link
          href="#packages"
          onClick={dismiss}
          className="gold-surface flex w-full items-center justify-center rounded-md bg-secondary px-3 py-2 font-mona text-[13px] font-medium text-primary transition-transform duration-300 hover:-translate-y-0.5"
        >
          See what&apos;s included
        </Link>
      </div>
    </aside>
  );
}
