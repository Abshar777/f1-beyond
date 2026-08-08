import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";

/**
 * Who we are — a centred statement, nothing else.
 *
 * Started life as a two-column layout with a counter grid and three pillar
 * columns; both were cut. The counters duplicated figures already shown in the
 * stats strip and the video panel, and the pillars restated the vision and
 * mission panels that follow immediately below. What is left is the one thing
 * this section is actually for: saying plainly who runs the desk.
 *
 * On a phone the origin-story paragraph is dropped — two blocks of prose back to
 * back is a lot to scroll past there — leaving the heading, the differentiating
 * paragraph and the CTA.
 */
export default function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className="relative overflow-hidden bg-bg py-20 lg:py-[90px] 2xl:py-[130px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-16%] left-1/2 -z-10 h-[540px] w-[540px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[150px]"
        style={{
          background:
            "radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[820px] text-center">
          <SectionHeading
            eyebrow="who we are"
            className="!mb-7"
            title={
              <>
                A trading desk that
                decided to <em>teach</em>
              </>
            }
          />

          <Reveal>
            {/* The origin story is the first thing to go on a phone: by this
                point the page has already said who we are, and the paragraph
                below carries what actually differentiates the desk. */}
            <p className="mb-5 hidden font-mona text-[17px] leading-[178%] text-text md:block">
              Beyondpips started as a small group of full-time traders sharing a
              desk in Dubai. The questions we kept answering for friends turned
              into a curriculum, and the curriculum turned into an academy.
            </p>
            <p className="mb-9 font-mona text-[17px] leading-[178%] text-text">
              We teach forex, crypto, indices and metals the way we learned them
              — slowly, on real charts, with a written plan and a hard rule about
              how much of the account any single idea is allowed to cost. Every
              mentor here trades their own capital, and none of us will sell you
              a signal.
            </p>

            <div className="flex justify-center">
              <ThemeButton href="#packages" variant="secondary">
                See the programme
              </ThemeButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
