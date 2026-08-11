"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import { savePost, type ActionState } from "./actions";
import type { Post } from "@/lib/posts";

const initial: ActionState = {};

const FIELD =
  "w-full rounded-md border border-primary/12 bg-bg px-3.5 py-2.5 font-mona text-[14.5px] text-primary outline-none transition-colors duration-200 focus:border-secondary";

const LABEL = "mb-1.5 block font-mona text-[12.5px] font-medium text-text";

const HINT = "mt-1.5 font-mona text-[12px] leading-[155%] text-text/80";

/** Bundled images, offered as a shortcut next to pasting a link. */
const IMAGE_OPTIONS = [
  "/assets/imgs/stock/trading-charts-1.jpg",
  "/assets/imgs/stock/trading-chart-2.jpg",
  "/assets/imgs/stock/trading-screens.jpg",
  "/assets/imgs/stock/trading-desk.jpg",
  "/assets/imgs/stock/trading-laptop.jpg",
  "/assets/imgs/stock/seminar-stage.jpg",
  "/assets/imgs/stock/seminar-class.jpg",
];

const AVATAR_OPTIONS = [
  "/assets/imgs/home2/blog/blog-user2_1.webp",
  "/assets/imgs/home2/blog/blog-user2_2.webp",
  "/assets/imgs/home2/blog/blog-user2_3.webp",
];

/**
 * Create/edit form for a market note.
 *
 * One component for both modes: an existing `post` supplies the defaults and a
 * hidden `id` that tells `savePost` to update rather than insert. Splitting it
 * into two forms would mean maintaining the same fifteen fields twice.
 *
 * Body is a plain textarea, blank-line separated. The public page renders each
 * paragraph as its own `<p>`, so the split happens on save and the author never
 * has to think about markup — a rich-text editor would be a much bigger
 * dependency for content that is only ever paragraphs.
 */
export default function PostForm({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState(savePost, initial);
  // Mirrored into state purely so the live preview can show the derived slug.
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // Mirrored so the avatar field can preview the initials it will generate.
  const [author, setAuthor] = useState(post?.author ?? "");

  const derivedSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <form action={action}>
      {post?.id && <input type="hidden" name="id" value={post.id} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mona text-[24px] font-medium tracking-[-0.025em] text-primary">
            {post ? "Edit note" : "New note"}
          </h1>
          <p className="mt-1 font-mona text-[13.5px] text-text">
            {post ? (
              <>
                Live at{" "}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-secondary underline underline-offset-2"
                >
                  /blog/{post.slug}
                </Link>
              </>
            ) : (
              "It goes live on the blog as soon as you save."
            )}
          </p>
        </div>
        <Link
          href="/admin"
          className="font-mona text-[13.5px] font-medium text-text transition-colors hover:text-secondary"
        >
          ← All notes
        </Link>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red/20 bg-red/[0.06] px-4 py-3 font-mona text-[13.5px] leading-[160%] text-red"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* ── main ── */}
        <div className="rounded-[12px] border border-primary/10 bg-white p-6">
          <div className="mb-5">
            <label className={LABEL} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              onChange={(event) => setTitle(event.target.value)}
              className={FIELD}
            />
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={post?.slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder={derivedSlug || "derived-from-the-title"}
              className={FIELD}
            />
            <p className={HINT}>
              Leave blank to derive it from the title. Lowercase letters, numbers
              and hyphens only.
              {post && (
                <>
                  {" "}
                  Changing this changes the note&apos;s URL and breaks any
                  existing links to it.
                </>
              )}
            </p>
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="excerpt">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              defaultValue={post?.excerpt}
              className={`${FIELD} resize-y`}
            />
            <p className={HINT}>
              One or two sentences. Shows on the index and in the share card.
            </p>
          </div>

          <div>
            <label className={LABEL} htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={16}
              defaultValue={post?.body.join("\n\n")}
              className={`${FIELD} resize-y leading-[175%]`}
            />
            <p className={HINT}>
              Separate paragraphs with a blank line. The first one renders larger,
              as a standfirst.
            </p>
          </div>
        </div>

        {/* ── meta ── */}
        <div className="rounded-[12px] border border-primary/10 bg-white p-6">
          <div className="mb-5">
            <label className={LABEL} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              name="category"
              required
              list="category-suggestions"
              defaultValue={post?.category}
              className={FIELD}
            />
            {/* A datalist rather than a select: the index derives its filter
                pills from whatever categories exist, so a new one must be
                possible without a code change. */}
            <datalist id="category-suggestions">
              {["Risk", "Crypto", "Psychology", "Process", "Execution", "Getting started"].map(
                (option) => (
                  <option key={option} value={option} />
                ),
              )}
            </datalist>
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="author">
              Author
            </label>
            <input
              id="author"
              name="author"
              required
              defaultValue={post?.author}
              onChange={(event) => setAuthor(event.target.value)}
              className={FIELD}
            />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL} htmlFor="publishedAt">
                Published
              </label>
              <input
                id="publishedAt"
                name="publishedAt"
                type="date"
                required
                defaultValue={post?.publishedAt}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="readMinutes">
                Read (min)
              </label>
              <input
                id="readMinutes"
                name="readMinutes"
                type="number"
                min={1}
                max={60}
                defaultValue={post?.readMinutes ?? 5}
                className={FIELD}
              />
            </div>
          </div>

          <div className="mb-5">
            <ImageField
              name="image"
              label="Cover image"
              value={post?.image}
              options={IMAGE_OPTIONS}
              hint="Upload a file, paste a direct link, or pick a bundled one. Up to 5MB. Shown on the index, the post header and the share card."
            />
          </div>

          <div className="mb-6">
            <ImageField
              name="avatar"
              label="Author photo"
              value={post?.avatar}
              options={AVATAR_OPTIONS}
              round
              optional
              initialsName={author}
              hint="Upload a photo, paste a link, or leave it empty — an avatar is then generated from the author's name, on a colour derived from it."
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="gold-surface w-full cursor-pointer rounded-md bg-secondary px-4 py-2.5 font-mona text-[14px] font-medium text-primary transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : post ? "Save changes" : "Publish note"}
          </button>
        </div>
      </div>
    </form>
  );
}
