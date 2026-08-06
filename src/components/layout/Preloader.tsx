"use client";

import { useEffect, useState } from "react";

/**
 * Full-viewport preloader shown while the page's initial resources load.
 *
 * The original template dismisses this with a GSAP tween whose onComplete
 * can fail to fire (a ScrollSmoother ticker issue), occasionally leaving the
 * page stuck behind the spinner. This rebuild doesn't use ScrollSmoother, so
 * it's dismissed with a plain CSS opacity/visibility transition instead:
 * triggered by `window.load` (or immediately if the page has already
 * finished loading), plus a hard ~2s timeout fallback so it can never get
 * stuck no matter what.
 */
export default function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      setHidden(true);
      // Cue the hero's 3D intro at the *start* of the exit, not after it:
      // fired on unmount the coins only began once the panels had already
      // cleared, so the two animations ran back to back instead of together.
      // Starting here means the cluster is already spinning as the panels
      // part, and the reveal lands on motion.
      // The flag covers the race where the listener mounts after this fires —
      // the coin canvas is dynamically imported, so on a warm cache it can
      // arrive later than the preloader exits.
      window.__preloaderDone = true;
      window.dispatchEvent(new CustomEvent("preloader:done"));

      // Matches the exit choreography below (0.35s mark collapse + 0.9s
      // panel lift), then removes the overlay from the DOM entirely.
      window.setTimeout(() => setMounted(false), 1250);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss);
    }

    // Hard fallback: guarantees the page is never stuck behind the
    // preloader, no matter what happens with the load event.
    const fallback = window.setTimeout(dismiss, 2000);

    return () => {
      window.removeEventListener("load", dismiss);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-hidden={hidden}
      // Two panels that split apart on exit rather than a flat fade — the
      // page is revealed between them. `visibility` is deferred to the end of
      // the transition so the panels stay visible while they travel.
      className={`fixed inset-0 z-[999999] ${
        hidden ? "pointer-events-none" : ""
      }`}
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      <style>{`
        @keyframes preloader-sweep {
          0%   { transform: translateX(-100%); }
          55%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes preloader-breathe {
          0%   { transform: scale(0.97); opacity: 0.85; }
          100% { transform: scale(1.03); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .preloader-panel, .preloader-mark { transition-duration: 1ms !important; }
          .preloader-bar-fill, .preloader-mark img { animation: none !important; }
        }
      `}</style>

      {/* top half */}
      <div
        className={`preloader-panel absolute inset-x-0 top-0 h-1/2 bg-primary transition-transform duration-[900ms] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)", transitionDelay: "260ms" }}
      />
      {/* bottom half */}
      <div
        className={`preloader-panel absolute inset-x-0 bottom-0 h-1/2 bg-primary transition-transform duration-[900ms] ${
          hidden ? "translate-y-full" : "translate-y-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)", transitionDelay: "260ms" }}
      />
      <div
        className={`preloader-mark absolute inset-0 grid place-items-center transition-all duration-[350ms] ease-in ${
          hidden ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
      >
      {/* Mark over a determinate-looking gold bar, rather than a spinner —
          quieter, and it reads as progress instead of an idle wait. */}
      <div className="flex w-[180px] flex-col items-center gap-7">
        <img
          src="/assets/imgs/logo/logo-mark.png"
          alt="Logo"
          className="h-14 w-14"
          style={{
            animationName: "preloader-breathe",
            animationDuration: "1.15s",
            animationDirection: "alternate",
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        />

        <div className="h-px w-full overflow-hidden bg-white/12">
          <div
            className="preloader-bar-fill h-full w-full bg-gradient-to-r from-transparent via-secondary to-transparent"
            style={{
              animationName: "preloader-sweep",
              animationDuration: "1.4s",
              animationTimingFunction: "cubic-bezier(0.65,0,0.35,1)",
              animationIterationCount: "infinite",
            }}
          />
        </div>

        <span className="font-mona text-[11px] tracking-[0.22em] text-white/40 uppercase">
          Loading
        </span>
      </div>
      </div>
    </div>
  );
}
