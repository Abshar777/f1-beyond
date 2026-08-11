import {
  Bitcoin,
  Bot,
  Brain,
  CandlestickChart,
  ChartColumn,
  ChartLine,
  Coins,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";

type CategoryItem = {
  name: string;
  Icon: LucideIcon;
};

/**
 * Source markup reference: .category2 / .category2__card etc. All 9 cards in
 * the source template link to the same course-details demo page and share the
 * same "Live weekly sessions" placeholder count — carried over as-is.
 */
const CATEGORIES: CategoryItem[] = [
  { name: "Forex Trading", Icon: CandlestickChart },
  { name: "Crypto Trading", Icon: Bitcoin },
  { name: "Technical Analysis", Icon: ChartLine },
  { name: "Risk Management", Icon: ShieldCheck },
  { name: "Trading Psychology", Icon: Brain },
  { name: "Commodities & Metals", Icon: Coins },
  { name: "Indices & Stocks", Icon: ChartColumn },
  { name: "Algo & Automation", Icon: Bot },
  { name: "Fundamentals & News", Icon: Newspaper },
];

export default function Category2() {
  return (
    <section id="markets" className="category2 pb-px">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="category2__wrap py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="category2__content w-full lg:w-4/12">
              <SectionHeading
                eyebrow="What we teach"
                align="left"
                title="Markets & disciplines"
                className="!mb-0"
              />
              <p className="category2__desc mb-[30px] mt-4 max-w-[400px] font-mona text-base leading-[1.6] text-text lg:mb-10">
                From your first chart to a repeatable edge — structured tracks across
                every market our mentors trade themselves.
              </p>
              <ThemeButton href="/courses" variant="outline">
                browse all tracks
              </ThemeButton>
            </div>
            <div className="w-full lg:w-7/12 xl:pl-4 xl:pr-1">
              <Reveal
                stagger
                className="category2__grid-row grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3"
              >
                {CATEGORIES.map((category) => (
                  <a
                    key={category.name}
                    // was #programmes, which the popular-programmes section
                    // owned; the tiers now carry that content
                    href="#packages"
                    className="category2__card group flex h-full flex-col items-start gap-2.5 rounded-[10px] border border-border bg-white p-[9px] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-secondary/45 hover:shadow-[0_14px_30px_-18px_rgba(212,175,55,0.75)] sm:flex-row sm:items-center"
                  >
                    {/* gold on hover — this was bg-primary, which now resolves
                        to zinc-900 and turned the whole tile black */}
                    <div className="category2__card-icon flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[6px] bg-bg text-primary transition-colors duration-300 group-hover:bg-secondary group-hover:text-primary [&>svg]:h-[24px] [&>svg]:w-[24px] sm:h-[60px] sm:w-[60px] sm:[&>svg]:h-[30px] sm:[&>svg]:w-[30px]">
                      <category.Icon strokeWidth={1.6} aria-hidden />
                    </div>
                    <div className="category2__card-content flex flex-col">
                      <div className="category2__card-name mb-1.5 font-mona text-[14px] font-medium capitalize leading-[125%] text-primary transition-colors duration-300 group-hover:text-secondary sm:mb-2 sm:text-base">
                        {category.name}
                      </div>
                      <span className="category2__card-learners font-mona text-[12px] capitalize leading-[120%] text-text sm:text-sm">
                        Live weekly sessions
                      </span>
                    </div>
                  </a>
                ))}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
