import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Reveal from "@/components/ui/Reveal";
import Avatar from "@/components/ui/Avatar";
import ThemeButton from "@/components/ui/ThemeButton";
import { getPostBySlug, listPosts } from "@/lib/blog-repo";
import { formatPostDate } from "@/lib/posts";

type Params = { params: Promise<{ slug: string }> };

/**
 * Prerender whatever exists at build time. `dynamicParams` stays at its default
 * of true, so a note published from the admin afterwards renders on demand
 * rather than 404ing until the next deploy.
 */
export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Note not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const more = (await listPosts())
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <PageShell>
      <article>
        {/* ── header ── */}
        <section className="relative overflow-hidden bg-bg pt-[104px] pb-10 sm:pt-[120px] lg:pt-[132px]">
          <div
            aria-hidden
            className="pointer-events-none absolute top-[-18%] left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[150px]"
            style={{
              background:
                "radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
            }}
          />
          <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 lg:px-8">
            <Reveal y={20} className="mb-6">
              <nav
                aria-label="Breadcrumb"
                className="font-mona text-[13px] text-text"
              >
                <Link href="/" className="transition-colors hover:text-secondary">
                  Home
                </Link>
                <span className="mx-2 text-primary/25">/</span>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-secondary"
                >
                  Market notes
                </Link>
                <span className="mx-2 text-primary/25">/</span>
                <span className="text-primary">{post.category}</span>
              </nav>
            </Reveal>

            <Reveal>
              <span className="mb-4 inline-flex items-center gap-[5px] rounded-full border border-primary/10 bg-white px-[10px] py-[6px] font-mona text-[12.5px] font-medium text-primary">
                <svg width="4" height="4" viewBox="0 0 4 4" aria-hidden="true">
                  <circle cx="2" cy="2" r="2" fill="#d4af37" />
                </svg>
                {post.category}
              </span>

              <h1 className="mb-5 font-mona text-[28px] leading-[122%] font-medium tracking-[-0.03em] text-balance text-primary sm:text-[34px] lg:text-[42px]">
                {post.title}
              </h1>

              <p className="mb-7 font-mona text-[17px] leading-[178%] text-text">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-primary/10 pt-6">
                <Avatar name={post.author} src={post.avatar} size={38} />
                <span className="font-mona text-[14px] font-medium text-primary">
                  {post.author}
                </span>
                <span className="font-mona text-[13px] text-text">
                  {formatPostDate(post.publishedAt)} · {post.readMinutes} min read
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── cover ── */}
        <section className="bg-bg pb-12">
          <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[14px]">
                <img
                  src={post.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── body ── */}
        <section className="bg-bg pb-20 lg:pb-[90px]">
          <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 lg:px-8">
            <Reveal>
              {/* First paragraph is set larger as a standfirst — it carries the
                  argument, and the drop in size afterwards marks where the
                  detail begins. */}
              {post.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={`font-mona text-text ${
                    i === 0
                      ? "mb-6 text-[18px] leading-[180%] text-primary/85"
                      : "mb-6 text-[16.5px] leading-[186%]"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal className="mt-12">
              <div className="relative overflow-hidden rounded-[12px] border border-secondary/25 bg-primary p-7 lg:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(80% 80% at 92% 4%, rgba(212,175,55,0.16), transparent 62%)",
                  }}
                />
                <div className="relative sm:flex sm:items-center sm:justify-between sm:gap-8">
                  <div className="mb-6 sm:mb-0">
                    <h2 className="mb-2 font-mona text-[19px] leading-[132%] font-medium tracking-[-0.02em] text-white">
                      Put the numbers in yourself
                    </h2>
                    <p className="font-mona text-[14px] leading-[170%] text-white/55">
                      The pip calculator does the sizing arithmetic from this
                      note — free, no sign-up.
                    </p>
                  </div>
                  <ThemeButton
                    href="/pip-calculator"
                    keepHref
                    variant="secondary"
                    className="shrink-0"
                  >
                    Open the calculator
                  </ThemeButton>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── more notes ── */}
        <section className="bg-bg pb-20 lg:pb-[90px] 2xl:pb-[130px]">
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-mona text-[24px] leading-[120%] font-medium tracking-[-0.03em] text-primary lg:text-[30px]">
                More from the desk
              </h2>
              <Link
                href="/blog"
                className="font-mona text-[14px] font-medium text-primary underline decoration-secondary decoration-2 underline-offset-4 transition-colors duration-300 hover:text-secondary"
              >
                All market notes
              </Link>
            </div>

            <Reveal
              stagger
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {more.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-primary/10 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 font-mona text-[12px] font-medium text-secondary">
                      {item.category}
                    </span>
                    <h3 className="font-mona text-[17px] leading-[132%] font-medium tracking-[-0.02em] text-primary transition-colors duration-300 group-hover:text-secondary">
                      {item.title}
                    </h3>
                    <span className="mt-auto pt-5 font-mona text-[12.5px] text-text">
                      {formatPostDate(item.publishedAt)} · {item.readMinutes} min read
                    </span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
