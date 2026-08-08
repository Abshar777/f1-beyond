"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Plus } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";

type Faq = { id: string; q: string; a: string };

const FAQS: Faq[] = [
  {
    id: "free",
    q: "Are the packages really free right now?",
    a: "Yes — all three tiers are open at no cost while the desk is opening up, with no card required and nothing to cancel. The struck-through figures on the pricing cards are what they normally cost.",
  },
  {
    id: "beginner",
    q: "Do I need any trading experience to start?",
    a: "No. The Starter track assumes you have never opened a chart: it covers candles, sessions, order types and the vocabulary before anything else. Traders who arrive already profitable usually start at Pro Trader instead.",
  },
  {
    id: "capital",
    q: "How much capital do I need?",
    a: "None to learn. You work on a demo account for the first modules, and we would rather you stayed on demo until your journal shows a repeatable process. When you do go live, the position-sizing framework works the same on a small account as a large one.",
  },
  {
    id: "signals",
    q: "Do you give signals or copy trades?",
    a: "No, and we will not. Following someone else's entries teaches you nothing about why the trade was taken or when to leave it. You will finish able to find, size and exit your own trades.",
  },
  {
    id: "time",
    q: "How much time does the programme take?",
    a: "Around four to six hours a week. Live mentor sessions run twice weekly and are recorded, so a session you miss is never a session you lose. Access does not expire.",
  },
  {
    id: "sessions",
    q: "Are the live sessions actually live?",
    a: "They are. A mentor works real charts in real time, including the trades that go against them — which is usually the more useful half. Questions are answered on the call.",
  },
  {
    id: "certificate",
    q: "Is there a certificate at the end?",
    a: "Pro Trader and Institutional both finish with certification, awarded after your written trading plan has been reviewed by a mentor. It certifies that you completed the programme — it is not a licence to manage anyone else's money.",
  },
  {
    id: "risk",
    q: "What are my actual odds of making money?",
    a: "Most retail traders lose money, and no course changes that on its own. What education changes is whether your losses are controlled and survivable. We would rather tell you that up front than sell you a number we cannot back.",
  },
];

/**
 * FAQ accordion.
 *
 * Height is animated with GSAP rather than a CSS max-height guess or a
 * `grid-template-rows: 0fr/1fr` transition: GSAP measures the panel and lands on
 * a literal `height: auto`, so a long answer is never clipped and the panel
 * stays correct if the viewport is resized while it is open.
 *
 * One panel open at a time, and the first is open on load — set instantly on
 * mount via `mountedRef` so the section does not animate itself open while the
 * reader is still somewhere else on the page.
 */
export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mountedRef = useRef(false);

  useEffect(() => {
    const instant = !mountedRef.current;
    mountedRef.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const faq of FAQS) {
      const panel = panelRefs.current[faq.id];
      if (!panel) continue;
      const open = faq.id === openId;

      gsap.to(panel, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: instant || reduce ? 0 : 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }, [openId]);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-bg pb-20 lg:pb-[90px] 2xl:pb-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px]">
          <SectionHeading
            eyebrow="frequently asked"
            title={
              <>
                The questions we get{" "}
                <em>before</em> anyone enrols
              </>
            }
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-16">
          <Reveal stagger className="min-w-0">
            {FAQS.map((faq) => {
              const open = faq.id === openId;
              return (
                <div
                  key={faq.id}
                  className="border-b border-primary/10 first:border-t"
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : faq.id)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${faq.id}`}
                      className="group flex w-full cursor-pointer items-start justify-between gap-5 py-5 text-left"
                    >
                      <span
                        className={`font-mona text-[16.5px] leading-[145%] font-medium tracking-[-0.015em] transition-colors duration-300 lg:text-[17.5px] ${
                          open
                            ? "text-secondary"
                            : "text-primary group-hover:text-secondary"
                        }`}
                      >
                        {faq.q}
                      </span>
                      <span
                        aria-hidden
                        className={`mt-[3px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          open
                            ? "rotate-45 border-transparent bg-secondary text-white"
                            : "border-primary/15 text-primary group-hover:border-secondary group-hover:text-secondary"
                        }`}
                      >
                        <Plus size={14} strokeWidth={2.4} />
                      </span>
                    </button>
                  </h3>

                  {/* height/opacity are driven by GSAP; overflow-hidden is what
                      makes the collapse read as a wipe rather than a clip. */}
                  <div
                    id={`faq-panel-${faq.id}`}
                    role="region"
                    ref={(el) => {
                      panelRefs.current[faq.id] = el;
                    }}
                    className="h-0 overflow-hidden opacity-0"
                  >
                    <p className="max-w-[68ch] pr-10 pb-6 font-mona text-[15px] leading-[178%] text-text">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>

          {/* ── still stuck ── */}
          <Reveal>
            <div className="relative overflow-hidden rounded-[12px] border border-secondary/25 bg-primary p-7 lg:sticky lg:top-28">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(85% 85% at 90% 5%, rgba(212,175,55,0.18), transparent 62%)",
                }}
              />
              <div className="relative">
                <h3 className="mb-2.5 font-mona text-[19px] leading-[130%] font-medium tracking-[-0.02em] text-white">
                  Still deciding?
                </h3>
                <p className="mb-7 font-mona text-[14px] leading-[170%] text-white/55">
                  Ask the desk directly. A mentor will tell you honestly whether
                  the programme fits where you are — including when it does not.
                </p>
                <ThemeButton href="#contact" variant="secondary">
                  Talk to a mentor
                </ThemeButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
