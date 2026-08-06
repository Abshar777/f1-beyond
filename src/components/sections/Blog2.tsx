import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";

type Article = {
  category: string;
  image: string;
  avatar: string;
  author: string;
  date: string;
  title: string;
};

const articles: Article[] = [
  {
    category: "Risk",
    image: "/assets/imgs/stock/trading-charts-1.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_1.webp",
    author: "Marcus Reed",
    date: "May 15, 2026",
    title: "Position sizing: the one habit that keeps traders solvent...",
  },
  {
    category: "Crypto",
    image: "/assets/imgs/stock/trading-screens.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_2.webp",
    author: "Olivia Chen",
    date: "May 25, 2026",
    title: "Reading crypto liquidity before you take the entry...",
  },
  {
    category: "Psychology",
    image: "/assets/imgs/stock/seminar-stage.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_3.webp",
    author: "Daniel Roberts",
    date: "Jun 28, 2026",
    title: "Why most traders break their own rules — and how to stop...",
  },
];

/**
 * "Blog2" section — recent-articles grid with heading + "Read all notes" CTA.
 * Static/presentational; internal post links point to "#" (no blog detail
 * pages in this single-page project).
 */
export default function Blog2() {
  return (
    <section id="notes" className="py-20 lg:py-[90px] 2xl:py-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Market notes"
          align="center"
          title={
            <>
              Notes from the desk on <br />
              markets and <em>method</em>
            </>
          }
        />

        <Reveal
          stagger
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[35px]"
        >
          {articles.map((article) => (
            <div
              key={article.image}
              className="group flex flex-col rounded-[10px] bg-white transition-all duration-300"
            >
              <div className="relative w-full flex-shrink-0 overflow-hidden rounded-t-[10px] transition-all duration-300 aspect-[410/240]">
                <span className="absolute left-5 top-5 z-[9] rounded px-[10.4px] py-[7px] font-mona text-sm font-medium capitalize text-primary bg-white transition-all duration-300 hover:bg-secondary hover:text-white">
                  {article.category}
                </span>
                <a href="#">
                  <img
                    src={article.image}
                    alt="Blog Image"
                    className="h-full w-full rounded-t-[10px] object-cover transition-all duration-400 group-hover:scale-110"
                  />
                </a>
              </div>
              <div className="flex flex-grow flex-col rounded-b-[10px] border border-t-0 border-border px-5 pb-6 pt-[18px]">
                <div className="mb-1 flex flex-wrap items-center gap-5 xl:gap-10">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 font-mona text-sm font-medium capitalize text-primary transition-colors duration-300 hover:text-secondary lg:text-base"
                  >
                    <img
                      src={article.avatar}
                      alt="Author"
                      className="h-[22px] w-[22px] rounded-full object-cover"
                    />
                    <span>{article.author}</span>
                  </a>
                  <a
                    href="#"
                    className="relative font-mona text-sm text-primary transition-colors duration-300 before:absolute before:-left-2.5 before:top-1/2 before:h-[18px] before:w-px before:-translate-y-1/2 before:bg-border before:content-[''] hover:text-secondary lg:text-base xl:before:-left-5"
                  >
                    {article.date}
                  </a>
                </div>
                <div className="mt-2.5">
                  <a
                    href="#"
                    className="line-clamp-2 font-mona text-xl font-medium leading-[1.2] tracking-[-0.03em] text-primary transition-colors duration-300 group-hover:text-secondary lg:text-2xl"
                  >
                    {article.title}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="mt-[60px] text-center">
          <ThemeButton href="#" variant="outline" className="mx-auto">
            Read all notes
          </ThemeButton>
        </div>
      </div>
    </section>
  );
}
