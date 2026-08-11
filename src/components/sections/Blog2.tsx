import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ThemeButton from "@/components/ui/ThemeButton";
import Reveal from "@/components/ui/Reveal";
import Avatar from "@/components/ui/Avatar";
import { listPosts } from "@/lib/blog-repo";
import { formatPostDate } from "@/lib/posts";

/**
 * "Blog2" section — the three most recent market notes, with a link through to
 * the full index.
 *
 * Posts come from `@/lib/blog-repo`, shared with `/blog` and `/blog/[slug]`, so
 * the homepage strip can never drift out of sync with the index. Every link here
 * carries `keepHref`, because ThemeButton and this section's cards would
 * otherwise open the contact form instead of navigating.
 */
export default async function Blog2() {
  // Newest three. Falls back to the bundled seed if the database is absent,
  // so the homepage never renders an empty strip.
  const posts = (await listPosts()).slice(0, 3);

  return (
    <section id="notes" className="py-20 lg:py-[90px] 2xl:py-[130px]">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Market notes"
          align="center"
          title={
            <>
              Notes from the desk on{" "}
              markets and <em>method</em>
            </>
          }
        />

        <Reveal
          stagger
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[35px]"
        >
          {posts.map((article) => (
            <div
              key={article.slug}
              className="group flex flex-col rounded-[10px] bg-white transition-colors duration-300"
            >
              <div className="relative w-full flex-shrink-0 overflow-hidden rounded-t-[10px] transition-all duration-300 aspect-[410/240]">
                <span className="absolute left-5 top-5 z-[9] rounded px-[10.4px] py-[7px] font-mona text-sm font-medium capitalize text-primary bg-white transition-all duration-300 hover:bg-secondary hover:text-white">
                  {article.category}
                </span>
                <Link href={`/blog/${article.slug}`}>
                  <img
                    src={article.image}
                    alt="Blog Image"
                    className="h-full w-full rounded-t-[10px] object-cover transition-all duration-400 group-hover:scale-110"
                  />
                </Link>
              </div>
              <div className="flex flex-grow flex-col rounded-b-[10px] border border-t-0 border-border px-5 pb-6 pt-[18px]">
                <div className="mb-1 flex flex-wrap items-center gap-5 xl:gap-10">
                  <span className="inline-flex items-center gap-1 font-mona text-sm font-medium capitalize text-primary lg:text-base">
                    <Avatar
                      name={article.author}
                      src={article.avatar}
                      size={22}
                    />
                    <span>{article.author}</span>
                  </span>
                  <span
                    className="relative font-mona text-sm text-primary before:absolute before:-left-2.5 before:top-1/2 before:h-[18px] before:w-px before:-translate-y-1/2 before:bg-border before:content-[''] lg:text-base xl:before:-left-5"
                  >
                    {formatPostDate(article.publishedAt)}
                  </span>
                </div>
                <div className="mt-2.5">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="line-clamp-2 font-mona text-xl font-medium leading-[1.2] tracking-[-0.03em] text-primary transition-colors duration-300 group-hover:text-secondary lg:text-2xl"
                  >
                    {article.title}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="mt-[60px] text-center">
          <ThemeButton
            href="/blog"
            keepHref
            variant="outline"
            className="mx-auto"
          >
            Read all notes
          </ThemeButton>
        </div>
      </div>
    </section>
  );
}
