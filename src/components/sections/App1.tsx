import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";

/**
 * Programme CTA — dark gold-accented panel, image free.
 *
 * Uses <SectionHeading dark> rather than hand-rolled type: an earlier pass
 * copied the seminar page's own scale (11px label, 26/32px heading, -0.02em)
 * which read as a foreign block dropped into the page. Going through the
 * shared heading keeps the eyebrow pill, the Mona/Playfair pairing and the
 * gold italic accent identical to every other section.
 */
const HIGHLIGHTS = [
  "Live market analysis & chart reading",
  "Practical risk-management frameworks",
  "Trading psychology that actually works",
  "Hands-on strategy building sessions",
  "Live Q&A with the mentor desk",
  "A written, tested trading plan",
];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function App1() {
  return (
    <section className="relative z-[1] py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[10px] border border-secondary/20 bg-primary p-8 sm:p-10 lg:p-14">
            {/* corner bloom — sits inside the rounded clip */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 80% at 8% 6%, rgba(212,175,55,0.14), transparent 62%)",
              }}
            />

            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
              <div className="lg:max-w-[460px] lg:shrink-0">
                <SectionHeading
                  dark
                  align="left"
                  eyebrow="What you'll learn"
                  className="!mb-6"
                  title={
                    <>
                      Everything inside the <em>programme</em>
                    </>
                  }
                />
                <p className="mb-8 font-mona text-base leading-[170%] text-white/60">
                  No signals to follow blindly — you leave able to read the
                  chart, size the position and defend the plan yourself.
                </p>
                <ThemeButton href="#packages" variant="secondary">
                  Start trading
                </ThemeButton>
              </div>

              <ul className="grid flex-1 grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-white/[0.07] py-4 font-mona text-[15px] leading-[150%] text-white/75"
                  >
                    <span className="mt-px shrink-0 text-secondary">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
