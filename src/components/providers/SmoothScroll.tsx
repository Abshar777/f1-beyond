"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives Lenis from GSAP's ticker so scroll position and every ScrollTrigger
 * read off one clock; on separate loops, scrubbed animations visibly trail the
 * page. `lagSmoothing(0)` stops GSAP time-warping after a slow frame, which
 * would otherwise make Lenis jump.
 *
 * Lives in a child component so `useLenis` resolves the instance from context
 * rather than racing a ref: with `autoRaf: false` Lenis has no loop of its
 * own, so if this wiring is ever skipped it captures the wheel and never
 * advances — i.e. scrolling dies outright. Nothing here may early-return
 * before the ticker is attached.
 */
function LenisGsapBridge() {
  const lenis = useLenis();
  const pathname = usePathname();

  /**
   * Reset the scroll on navigation.
   *
   * Next restores/resets scroll by writing to the real scroll position, but
   * Lenis owns that value and keeps its own internal target — so after a client
   * navigation the new route rendered while still scrolled down the old one.
   * Clicking a post from halfway down /blog dropped you into the middle of the
   * article.
   *
   * `immediate` on purpose: this is a page change, not a scroll gesture, so it
   * should not animate the whole way back up.
   *
   * Anchors are excluded — Lenis handles `/#section` links itself, and forcing
   * the top here would fight them.
   */
  useEffect(() => {
    if (!lenis) return;
    if (window.location.hash) return;

    // BOTH sides have to be reset, and that is the whole bug.
    //
    // Lenis keeps its own `animatedScroll` value and writes it to the document
    // every frame. Telling only Lenis leaves the document where it was until the
    // next tick; moving only the document leaves Lenis's value stale, and its
    // next frame puts the old position straight back — which is why navigating
    // into a post from halfway down /blog landed mid-article.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [lenis, pathname]);

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Opt out by not mounting Lenis at all — leaving it mounted but unsmoothed
  // would still put it between the user and native scrolling.
  //
  // The admin is excluded for the same reason: it is a form-heavy tool, and
  // smooth scrolling fights the browser's own scroll-into-view when focus moves
  // between fields or a validation message appears.
  if (reduced || pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: 1.15,
        // long, flat tail — the "weighty glide" of an awards-site scroll
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
        // Hash links in the nav are handled by Lenis so they ease rather than
        // jump. The offset clears the fixed header, which would otherwise sit
        // over the heading of whichever section you land on.
        anchors: { offset: -96 },
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
