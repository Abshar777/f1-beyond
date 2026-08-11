"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";

/**
 * Image picker for the post editor: paste a link, or choose one of the images
 * already bundled in `/public`.
 *
 * The value the form submits is just a URL string in a hidden input, so the
 * server action needs no knowledge of where the image lives — a pasted
 * `https://…` and a bundled `/assets/imgs/…` path are interchangeable
 * everywhere downstream.
 *
 * The preview is not decoration. A pasted link is the one input here that can be
 * well-formed and still wrong — the wrong page, a hotlink-protected host, an
 * HTML page rather than a file — and none of that is visible from the string.
 * Loading it and reporting the failure is the only honest validation available
 * client-side.
 */
export default function ImageField({
  name,
  label,
  value,
  options,
  hint,
  round = false,
  optional = false,
  initialsName,
}: {
  name: string;
  label: string;
  value?: string;
  /** Images already in /public, offered as a quick alternative to a link. */
  options: string[];
  hint?: string;
  /** Author photos are circular; covers are a 16:10 panel. */
  round?: boolean;
  /** Blank is a valid value — the caller generates something from it. */
  optional?: boolean;
  /**
   * When `optional` and blank, preview the initials avatar this name produces.
   * Passed live from the author field, so the preview updates as it is typed.
   */
  initialsName?: string;
}) {
  // An optional field starts genuinely empty. Defaulting it to the first
  // bundled image would silently attach a stock photo nobody chose.
  const [url, setUrl] = useState(value ?? (optional ? "" : (options[0] ?? "")));
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    value ? "loading" : "idle",
  );

  /**
   * Single entry point for changing the value, so typing and picking from the
   * library both reset the check. Done here rather than in an effect on `url`:
   * this is a response to an event, and a synchronous setState inside an effect
   * would trigger a cascading render.
   */
  const applyUrl = (next: string) => {
    const trimmed = next.trim();
    setUrl(trimmed);
    setStatus(trimmed ? "loading" : "idle");
  };

  const looksAbsolute = /^https?:\/\//i.test(url);
  const looksRelative = url.startsWith("/");
  const malformed = url.trim() !== "" && !looksAbsolute && !looksRelative;

  return (
    <div>
      <span className="mb-1.5 block font-mona text-[12.5px] font-medium text-text">
        {label}
      </span>

      {/* The value the form actually submits. */}
      <input type="hidden" name={name} value={url} />

      <div className="rounded-md border border-primary/12 bg-bg p-3">
        {url && !malformed ? (
          <img
            src={url}
            alt=""
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
            className={`mb-3 bg-primary/[0.04] object-cover ${
              round
                ? "h-14 w-14 rounded-full"
                : "aspect-[16/10] w-full rounded"
            } ${status === "error" ? "hidden" : ""}`}
          />
        ) : null}

        {(status === "error" || malformed || !url) &&
          (optional && !url && initialsName?.trim() ? (
            // Exactly what the blog will render, not an approximation of it.
            <div className="mb-3 flex items-center gap-2.5">
              <Avatar name={initialsName} size={56} />
              <span className="font-mona text-[12px] leading-[150%] text-text">
                Generated from
                <br />
                &ldquo;{initialsName.trim()}&rdquo;
              </span>
            </div>
          ) : (
            <div
              className={`mb-3 flex items-center justify-center rounded bg-primary/[0.04] text-center font-mona text-[12.5px] text-text ${
                round ? "h-14 w-14 rounded-full" : "aspect-[16/10] w-full"
              }`}
            >
              {url ? "Nothing loaded" : optional ? "Add a name above" : "No image yet"}
            </div>
          ))}

        {/* `type="text"`, NOT `type="url"`. The url type only accepts an
            absolute URL with a scheme, so every site-relative path — which is
            what the bundled library and the default value both are — failed
            native constraint validation and silently blocked the whole form from
            submitting. `inputMode` still gets the URL keyboard on mobile, and
            the `malformed` check above does the validation properly by accepting
            "https://…" and "/…" alike. */}
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(event) => applyUrl(event.target.value)}
          placeholder="https://… or /assets/imgs/…"
          aria-label={`${label} URL`}
          className="w-full rounded border border-primary/12 bg-white px-2.5 py-1.5 font-mona text-[12.5px] text-primary outline-none transition-colors duration-200 focus:border-secondary"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={options.includes(url) ? url : ""}
            onChange={(event) => {
              if (event.target.value) applyUrl(event.target.value);
            }}
            aria-label={`Or choose a bundled image for ${label.toLowerCase()}`}
            className="cursor-pointer rounded border border-primary/12 bg-white px-2 py-1.5 font-mona text-[12.5px] text-primary"
          >
            <option value="">or pick from library…</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option.split("/").pop()}
              </option>
            ))}
          </select>

          {status === "ok" && (
            <span className="font-mona text-[12px] text-green">Link loads ✓</span>
          )}
          {/* Not "Checking…" for a string that was never going to be fetched —
              the malformed message below is the accurate one. */}
          {status === "loading" && !malformed && (
            <span className="font-mona text-[12px] text-text/70">Checking…</span>
          )}
        </div>

        {malformed && (
          <p role="alert" className="mt-2.5 font-mona text-[12px] leading-[155%] text-red">
            That needs to start with <code>https://</code> or <code>/</code>.
          </p>
        )}

        {status === "error" && !malformed && (
          <p role="alert" className="mt-2.5 font-mona text-[12px] leading-[155%] text-red">
            That link did not load. Check it points straight at an image file —
            a page URL or a hotlink-protected host will not render here or on the
            blog.
          </p>
        )}

        {hint && status !== "error" && !malformed && (
          <p className="mt-2.5 font-mona text-[12px] leading-[155%] text-text/80">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
