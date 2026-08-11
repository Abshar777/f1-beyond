import { Check, Compass, Eye } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

type Panel = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
  Icon: typeof Eye;
  dark: boolean;
};

const PANELS: Panel[] = [
  {
    id: "vision",
    kicker: "Our vision",
    title: "A generation of traders who manage risk before they chase returns",
    body: "We want retail trading in this region to stop looking like gambling. That means a standard of education where position sizing, journalling and a written plan are the baseline, not the advanced module.",
    points: [
      "Risk literacy treated as the first skill, not the last",
      "Education measured by student outcomes, not enrolments",
      "A desk graduates can still lean on years later",
    ],
    Icon: Eye,
    dark: true,
  },
  {
    id: "mission",
    kicker: "Our mission",
    title: "Teach the process we actually use, and be honest about the odds",
    body: "Every programme is taught by traders on live charts, in the open, with the losses left in. Our job is to hand over a repeatable process and the discipline to run it — not a set of calls to follow.",
    points: [
      "Live mentor sessions every trading week",
      "A tested, written trading plan before you finish",
      "Plain talk about how often retail accounts lose",
    ],
    Icon: Compass,
    dark: false,
  },
];

/**
 * Vision & mission — a two-panel statement between "who we are" and the FAQ.
 *
 * The two panels are deliberately opposite treatments rather than a matched
 * pair: vision on zinc-950 with gold, mission on white. A vision and a mission
 * read as the same kind of text otherwise, and the contrast is what makes it
 * obvious at a glance that these are two different claims.
 */
export default function VisionMission() {
  return (
    <section
      id="vision-mission"
      className="relative overflow-hidden bg-bg pb-20 lg:pb-[90px] 2xl:pb-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px]">
          <SectionHeading
            eyebrow="what we are here for"
            title={
              <>
                Where we are going, and
                how we <em>get there</em>
              </>
            }
          />
        </div>

        <Reveal stagger className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {PANELS.map((panel) => (
            <article
              key={panel.id}
              className={`relative overflow-hidden rounded-[12px] border p-8 transition-[transform,border-color] duration-500 hover:-translate-y-1.5 lg:p-10 ${
                panel.dark
                  ? "border-secondary/25 bg-primary hover:border-secondary/50"
                  : "border-primary/10 bg-white hover:border-secondary/40"
              }`}
            >
              {panel.dark && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(80% 80% at 92% 4%, rgba(212,175,55,0.16), transparent 62%)",
                  }}
                />
              )}

              <div className="relative">
                <span
                  className={`gold-surface mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-secondary ${
                    panel.dark ? "text-primary" : "text-white"
                  }`}
                >
                  <panel.Icon size={21} strokeWidth={1.9} aria-hidden />
                </span>

                <span
                  className={`mb-2.5 block font-mona text-[11px] font-semibold tracking-[0.09em] uppercase ${
                    panel.dark ? "text-secondary" : "text-text"
                  }`}
                >
                  {panel.kicker}
                </span>

                <h3
                  className={`mb-4 font-mona text-[23px] leading-[128%] font-medium tracking-[-0.025em] lg:text-[27px] ${
                    panel.dark ? "text-white" : "text-primary"
                  }`}
                >
                  {panel.title}
                </h3>

                <p
                  className={`mb-7 font-mona text-[15px] leading-[172%] ${
                    panel.dark ? "text-white/55" : "text-text"
                  }`}
                >
                  {panel.body}
                </p>

                <ul
                  className={`border-t pt-2 ${
                    panel.dark ? "border-white/[0.09]" : "border-primary/10"
                  }`}
                >
                  {panel.points.map((point) => (
                    <li
                      key={point}
                      className={`flex items-start gap-3 py-3 font-mona text-[14.5px] leading-[150%] ${
                        panel.dark ? "text-white/75" : "text-primary/85"
                      }`}
                    >
                      <span className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                        <Check size={11} strokeWidth={3} aria-hidden />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
