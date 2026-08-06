"use client";

import { type ReactNode, useEffect, useState } from "react";
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

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Opt out by not mounting Lenis at all — leaving it mounted but unsmoothed
  // would still put it between the user and native scrolling.
  if (reduced) return <>{children}</>;

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
