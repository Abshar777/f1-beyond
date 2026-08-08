import { Globe, LifeBuoy, Radio, Users, type LucideIcon } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import Odometer from "@/components/ui/Odometer";

type StatItem = {
  title: string;
  text: string;
  Icon: LucideIcon;
  /** Set where the title is a real quantity, so it rolls up on scroll. */
  count?: number;
  suffix?: string;
};

/**
 * Source markup reference: .feature-stats-2 / .feature-stats-2__item etc.
 * A slim icon + stat strip, no section heading — just 4 items in a row that
 * wrap into a 2-col grid on small phones and stack centered on tablets.
 */
const STATS: StatItem[] = [
  { title: "18k+", count: 18, suffix: "k+", text: "Traders mentored", Icon: Users },
  // Not quantities — "Live Sessions" and "24/5" have nothing to roll, so they
  // stay as plain text rather than being forced through a counter.
  { title: "Live Sessions", text: "Every trading week", Icon: Radio },
  { title: "6 Markets", count: 6, suffix: " Markets", text: "Forex, crypto & metals", Icon: Globe },
  { title: "24/5", text: "Desk support", Icon: LifeBuoy },
];

export default function FeatureStats2() {
  return (
    <div className="feature-stats-2 relative z-[1] bg-bg py-10 lg:pb-[34px] lg:pt-[46px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal
          stagger
          className="feature-stats-2__wrapper grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 xl:flex xl:flex-nowrap xl:items-center xl:justify-between xl:gap-0"
        >
          {STATS.map((stat, index) => (
            <div
              key={stat.title}
              className={`feature-stats-2__item relative flex min-w-0 items-center justify-start gap-2.5 lg:gap-3 ${
                index !== STATS.length - 1
                  ? "after:absolute after:top-1/2 after:-right-[94px] after:-translate-y-1/2 after:hidden after:h-[60px] after:w-px after:bg-border after:content-[''] xl:after:block"
                  : ""
              }`}
            >
              <div className="feature-stats-2__icon flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white text-secondery transition-all duration-300 hover:-translate-y-[3px] hover:bg-secondary sm:h-[50px] sm:w-[50px] lg:h-[60px] lg:w-[60px] [&>svg]:h-[21px] [&>svg]:w-[21px] sm:[&>svg]:h-[25px] sm:[&>svg]:w-[25px] lg:[&>svg]:h-[30px] lg:[&>svg]:w-[30px]">
                <stat.Icon strokeWidth={1.6} aria-hidden />
              </div>
              <div className="feature-stats-2__content flex min-w-0 flex-col">
                <div className="feature-stats-2__title mb-[2px] font-mona text-[15px] font-medium capitalize leading-[125%] text-primary sm:text-base">
                  {stat.count !== undefined ? (
                    <>
                      <Odometer value={stat.count} />
                      {stat.suffix}
                    </>
                  ) : (
                    stat.title
                  )}
                </div>
                <p className="feature-stats-2__text font-mona text-[13px] leading-[150%] text-primary sm:text-[14.5px] lg:text-base lg:leading-[160%]">
                  {stat.text}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}
