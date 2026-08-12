"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import { saveTestimonial } from "./testimonial-actions";
import {
  initialOf,
  slugifyName,
  type Testimonial,
} from "@/lib/testimonials";
import type { ActionState } from "./actions";

const initial: ActionState = {};

const FIELD =
  "w-full rounded-md border border-primary/12 bg-bg px-3.5 py-2.5 font-mona text-[14.5px] text-primary outline-none transition-colors duration-200 focus:border-secondary";

const LABEL = "mb-1.5 block font-mona text-[12.5px] font-medium text-text";

const HINT = "mt-1.5 font-mona text-[12px] leading-[155%] text-text/80";

/** Matches the validation ceiling in `testimonial-actions.ts`. */
const QUOTE_LIMIT = 400;

/** Bundled headshots, offered as a shortcut next to uploading or pasting. */
const PHOTO_OPTIONS = [
  "/assets/imgs/home2/blog/blog-user2_1.webp",
  "/assets/imgs/home2/blog/blog-user2_2.webp",
  "/assets/imgs/home2/blog/blog-user2_3.webp",
];

/**
 * The gold letter badge the carousel falls back to when there is no photo.
 *
 * Sized inline rather than by a utility class because the value is a prop —
 * Tailwind cannot generate a class for a number it never sees at build time.
 */
function LetterBadge({ letter, size }: { letter: string; size: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-secondary/15 font-mona font-medium text-secondary uppercase"
    >
      {letter}
    </span>
  );
}

/** Same five-point star as the carousel, so the preview is not an approximation. */
const STAR_PATH =
  "M12 2.5l2.9 6.06 6.6.86-4.8 4.62 1.2 6.56L12 17.5l-5.9 3.1 1.2-6.56-4.8-4.62 6.6-.86z";

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-[2px]" aria-label={`${count} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" aria-hidden>
          <path
            d={STAR_PATH}
            fill={i < count ? "#d4af37" : "rgba(9,9,11,0.14)"}
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Create/edit form for a carousel review.
 *
 * One component for both modes: an existing `testimonial` supplies the defaults
 * and a hidden `id` that tells `saveTestimonial` to update rather than insert.
 *
 * The preview is the reason this is a client component. The quote has to fit a
 * fixed-height card in a carousel, and a character count alone does not tell you
 * whether five short lines or three long ones will overflow — seeing it in
 * roughly the real card does.
 */
export default function TestimonialForm({
  testimonial,
  /** How many reviews are stored, so the position field can say "of N". */
  total = 0,
}: {
  testimonial?: Testimonial;
  total?: number;
}) {
  const [state, action, pending] = useActionState(saveTestimonial, initial);

  // Mirrored into state only to drive the preview and the derived-value hints.
  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [initialOverride, setInitialOverride] = useState(
    testimonial?.initial ?? "",
  );
  const [slug, setSlug] = useState(testimonial?.slug ?? "");
  const [photo, setPhoto] = useState(testimonial?.photo ?? "");

  const derivedSlug = slug || slugifyName(name);
  const derivedInitial = initialOverride || initialOf(name);
  const overLimit = quote.length > QUOTE_LIMIT;

  return (
    <form action={action}>
      {testimonial?.id && (
        <input type="hidden" name="id" value={testimonial.id} />
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mona text-[24px] font-medium tracking-[-0.025em] text-primary">
            {testimonial ? "Edit review" : "New review"}
          </h1>
          <p className="mt-1 font-mona text-[13.5px] text-text">
            {testimonial
              ? "Changes appear in the homepage carousel as soon as you save."
              : "It joins the end of the homepage carousel as soon as you save."}
          </p>
        </div>
        <Link
          href="/admin/testimonials"
          className="font-mona text-[13.5px] font-medium text-text transition-colors hover:text-secondary"
        >
          ← All reviews
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
            <label className={LABEL} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={testimonial?.name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Emily E. Carter"
              className={FIELD}
            />
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="role">
              Role line
            </label>
            <input
              id="role"
              name="role"
              required
              defaultValue={testimonial?.role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Forex · 2 years trading"
              className={FIELD}
            />
            <p className={HINT}>
              What they trade and how long for. &ldquo;· Verified Google
              review&rdquo; is appended automatically on the card.
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label className={LABEL.replace("mb-1.5 ", "")} htmlFor="quote">
                Quote
              </label>
              <span
                className={`font-mona text-[12px] ${
                  overLimit ? "font-medium text-red" : "text-text/70"
                }`}
              >
                {quote.length}/{QUOTE_LIMIT}
              </span>
            </div>
            <textarea
              id="quote"
              name="quote"
              required
              rows={7}
              defaultValue={testimonial?.quote}
              onChange={(event) => setQuote(event.target.value)}
              className={`${FIELD} resize-y leading-[170%] ${
                overLimit ? "border-red/40" : ""
              }`}
            />
            <p className={HINT}>
              No quote marks needed — the card adds them. Specifics beat
              superlatives: what changed, and by how much.
            </p>
          </div>
        </div>

        {/* ── meta + preview ── */}
        <div className="rounded-[12px] border border-primary/10 bg-white p-6">
          <div className="mb-5">
            <label className={LABEL} htmlFor="rating">
              Rating
            </label>
            <div className="flex items-center gap-3">
              <input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                required
                defaultValue={testimonial?.rating ?? 5}
                onChange={(event) => setRating(Number(event.target.value))}
                className={`${FIELD} w-20`}
              />
              <Stars count={Math.min(5, Math.max(0, Math.round(rating) || 0))} />
            </div>
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="order">
              Position
            </label>
            <div className="flex items-center gap-3">
              <input
                id="order"
                name="order"
                type="number"
                min={1}
                max={testimonial ? total : total + 1}
                defaultValue={testimonial?.order}
                placeholder={String(testimonial ? total : total + 1)}
                className={`${FIELD} w-20`}
              />
              <span className="font-mona text-[12px] text-text/80">
                of {testimonial ? total : total + 1}
              </span>
            </div>
            <p className={HINT}>
              Where it sits in the carousel. Leave blank to{" "}
              {testimonial ? "keep it where it is" : "put it last"}. Everything
              else shifts to make room, and the arrows on the list are quicker for
              small moves.
            </p>
          </div>

          <div className="mb-5">
            <label className={LABEL} htmlFor="initial">
              Avatar letter
            </label>
            <input
              id="initial"
              name="initial"
              maxLength={2}
              defaultValue={testimonial?.initial}
              onChange={(event) => setInitialOverride(event.target.value)}
              placeholder={initialOf(name) === "·" ? "E" : initialOf(name)}
              className={`${FIELD} w-20 text-center uppercase`}
            />
            <p className={HINT}>
              Leave blank to use the first letter of the name.
            </p>
          </div>

          <div className="mb-5">
            <ImageField
              name="photo"
              label="Reviewer photo"
              value={testimonial?.photo}
              options={PHOTO_OPTIONS}
              round
              optional
              onChange={setPhoto}
              fallbackPreview={<LetterBadge letter={derivedInitial} size={56} />}
              hint="Upload a headshot, paste a link, or leave it empty — the gold letter badge is used instead. Up to 5MB."
            />
          </div>

          <div className="mb-6">
            <label className={LABEL} htmlFor="slug">
              Key
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={testimonial?.slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder={derivedSlug || "derived-from-the-name"}
              className={FIELD}
            />
            <p className={HINT}>
              Leave blank to derive it from the name. Only needs changing if two
              reviewers share a name.
            </p>
          </div>

          {/* ── preview ── deliberately the card's real proportions and type
              sizes, so "does this overflow?" is answerable here. */}
          <span className={LABEL}>Preview</span>
          <div className="rounded-[10px] border border-secondary/40 bg-white p-4 shadow-[0_18px_44px_-38px_rgba(9,9,11,0.5)]">
            <div className="flex items-center justify-between gap-3">
              <Stars count={Math.min(5, Math.max(0, Math.round(rating) || 0))} />
              <span className="font-mona text-[10px] font-medium text-text/60">
                Google
              </span>
            </div>
            <blockquote className="mt-3 mb-4 font-mona text-[13px] leading-[165%] text-primary">
              {quote.trim() ? (
                <>&ldquo;{quote.trim()}&rdquo;</>
              ) : (
                <span className="text-text/60">The quote appears here.</span>
              )}
            </blockquote>
            <figcaption className="flex items-center gap-2.5 border-t border-primary/10 pt-3.5">
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full bg-primary/[0.04] object-cover"
                />
              ) : (
                <LetterBadge letter={derivedInitial} size={32} />
              )}
              <span className="block min-w-0">
                <span className="block truncate font-mona text-[12.5px] leading-tight font-medium text-primary">
                  {name.trim() || "Name"}
                </span>
                <span className="mt-0.5 block truncate font-mona text-[11px] leading-snug text-text">
                  {role.trim() || "Role line"} · Verified Google review
                </span>
              </span>
            </figcaption>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="gold-surface mt-6 w-full cursor-pointer rounded-md bg-secondary px-4 py-2.5 font-mona text-[14px] font-medium text-primary transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : testimonial
                ? "Save changes"
                : "Publish review"}
          </button>
        </div>
      </div>
    </form>
  );
}
