import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ThemeButton from "@/components/ui/ThemeButton";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Market notes — trading process, risk and psychology",
  description:
    "Notes from the Beyondpips desk on position sizing, execution, trading psychology and getting started.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Market notes — trading process, risk and psychology",
    description:
      "No calls and no signals. Notes on the parts of trading that decide whether an account survives.",
    url: "/blog",
  },
};

const [featured, ...rest] = POSTS;

/** Derived from the posts themselves, so a new category never needs registering. */
const CATEGORIES = [...new Set(POSTS.map((post) => post.category))];

function Meta({ post, dark = false }: { post: (typeof POSTS)[number]; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <img
        src={post.avatar}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
      <span
        className={`font-mona text-[13px] font-medium ${dark ? "text-white" : "text-primary"}`}
      >
        {post.author}
      </span>
      <span
        className={`font-mona text-[12.5px] ${dark ? "text-white/45" : "text-text"}`}
      >
        {post.date} · {post.readMinutes} min read
      </span>
    </div>
  );
}

export default function BlogPage() {
  return (
    <PageShell>
      {/* ── page header ── */}
      <section className="relative overflow-hidden bg-bg pt-[104px] pb-12 sm:pt-[120px] lg:pt-[132px]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-18%] left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Reveal y={20} className="mb-5">
            <nav aria-label="Breadcrumb" className="font-mona text-[13px] text-text">
              <Link href="/" className="transition-colors hover:text-secondary">
                Home
              </Link>
              <span className="mx-2 text-primary/25">/</span>
              <span className="text-primary">Market notes</span>
            </nav>
          </Reveal>

          <div className="mx-auto max-w-[760px] text-center">
            <SectionHeading
              eyebrow="market notes"
              className="!mb-6"
              title={
                <>
                  What the desk is <em>actually</em> thinking about
                </>
              }
            />
            <Reveal>
              <p className="mb-8 font-mona text-[17px] leading-[178%] text-text">
                No calls, no signals, no charts with arrows drawn after the fact.
                Notes on the parts of trading that decide whether an account
                survives: sizing, execution, process and psychology.
              </p>
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {CATEGORIES.map((category) => (
                  <li
                    key={category}
                    className="rounded-full border border-primary/10 bg-white px-3 py-1.5 font-mona text-[12.5px] font-medium text-primary"
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── featured ── */}
      <section className="bg-bg pb-14">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-[14px] border border-primary/10 bg-primary transition-all duration-500 hover:border-secondary/45 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
                <img
                  src={featured.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="gold-surface rounded-full bg-secondary px-2.5 py-1 font-mona text-[11px] font-semibold tracking-[0.05em] text-primary uppercase">
                    Latest
                  </span>
                  <span className="font-mona text-[12.5px] text-secondary">
                    {featured.category}
                  </span>
                </div>
                <h2 className="mb-3.5 font-mona text-[24px] leading-[128%] font-medium tracking-[-0.03em] text-white transition-colors duration-300 group-hover:text-secondary lg:text-[30px]">
                  {featured.title}
                </h2>
                <p className="mb-7 font-mona text-[15px] leading-[175%] text-white/55">
                  {featured.excerpt}
                </p>
                <Meta post={featured} dark />
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── the rest ── */}
      <section className="bg-bg pb-20 lg:pb-[90px] 2xl:pb-[130px]">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Reveal
            stagger
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {rest.map((post) => (
              <article key={post.slug} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-primary/10 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-[0_24px_60px_-45px_rgba(9,9,11,0.5)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/90 px-2.5 py-1 font-mona text-[11.5px] font-medium text-primary backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-2.5 font-mona text-[18px] leading-[132%] font-medium tracking-[-0.02em] text-primary transition-colors duration-300 group-hover:text-secondary">
                      {post.title}
                    </h2>
                    <p className="mb-6 font-mona text-[14px] leading-[172%] text-text">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto border-t border-primary/10 pt-5">
                      <Meta post={post} />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </Reveal>

          <Reveal className="mt-14">
            <div className="rounded-[12px] border border-primary/10 bg-white p-8 text-center lg:p-10">
              <h3 className="mx-auto mb-2.5 max-w-[440px] font-mona text-[21px] leading-[132%] font-medium tracking-[-0.025em] text-primary">
                Want these worked through on a live chart?
              </h3>
              <p className="mx-auto mb-7 max-w-[440px] font-mona text-[14.5px] leading-[172%] text-text">
                The mentor desk runs twice weekly, and every package is free while
                we are opening up.
              </p>
              <div className="flex justify-center">
                <ThemeButton variant="secondary">Talk to the desk</ThemeButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
