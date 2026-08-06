import { Globe, LifeBuoy, Radio, Users, type LucideIcon } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type StatItem = {
  title: string;
  text: string;
  Icon: LucideIcon;
};

/**
 * Source markup reference: .feature-stats-2 / .feature-stats-2__item etc.
 * A slim icon + stat strip, no section heading — just 4 items in a row that
 * wrap into a 2-col grid on small phones and stack centered on tablets.
 */
const STATS: StatItem[] = [
  { title: "18k+", text: "Traders mentored", Icon: Users },
  { title: "Live Sessions", text: "Every trading week", Icon: Radio },
  { title: "6 Markets", text: "Forex, crypto & metals", Icon: Globe },
  { title: "24/5", text: "Desk support", Icon: LifeBuoy },
];

export default function FeatureStats2() {
  return (
    <div className="feature-stats-2 relative z-[1] bg-bg py-10 lg:pb-[34px] lg:pt-[46px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal
          stagger
          className="feature-stats-2__wrapper flex flex-wrap grid-cols-2 items-center justify-between md:gap-5 gap-x-1 gap-y-6 xl:flex-nowrap xl:gap-0"
        >
          {STATS.map((stat, index) => (
            <div
              key={stat.title}
              className={`feature-stats-2__item relative flex w-full items-center justify-start gap-2.5 min-[376px]:w-[48%] md:w-auto md:justify-center md:gap-[5px] lg:justify-start lg:gap-3 ${
                index !== STATS.length - 1
                  ? "after:absolute after:top-1/2 after:-right-[94px] after:-translate-y-1/2 after:hidden after:h-[60px] after:w-px after:bg-border after:content-[''] xl:after:block"
                  : ""
              }`}
            >
              <div className="feature-stats-2__icon flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white text-secondery transition-all duration-300 hover:-translate-y-[3px] hover:bg-secondary lg:h-[60px] lg:w-[60px] [&>svg]:h-[25px] [&>svg]:w-[25px] lg:[&>svg]:h-[30px] lg:[&>svg]:w-[30px]">
                <stat.Icon strokeWidth={1.6} aria-hidden />
              </div>
              <div className="feature-stats-2__content flex flex-col">
                <div className="feature-stats-2__title mb-[2px] font-mona text-base font-medium capitalize leading-[120%] text-primary">
                  {stat.title}
                </div>
                <p className="feature-stats-2__text font-mona text-base leading-[160%] text-primary md:text-[14.5px] lg:text-base">
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
