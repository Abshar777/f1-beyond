"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { Check, X } from "lucide-react";
import ThemeButton from "@/components/ui/ThemeButton";
import { sendEnquiry } from "@/lib/enquiry";
import {
  CONTACT_MODAL_OPEN_EVENT,
  CONTACT_MODAL_REQUEST_EVENT,
} from "@/lib/contact-modal";

const FIELD_CLASSES =
  "w-full rounded-md border border-primary/12 bg-bg px-3.5 py-2.5 font-mona text-[14.5px] text-primary outline-none transition-colors duration-200 placeholder:text-text/70 focus:border-secondary";

const LABEL_CLASSES =
  "mb-1.5 block font-mona text-[12.5px] font-medium text-text";

/**
 * Contact form in a modal. Opens only when something asks it to — every
 * `ThemeButton` on the site does, via `openContactModal()`.
 *
 * Submissions go to the Google Sheet through `sendEnquiry` (see `lib/enquiry.ts`),
 * which posts to the sheet's Apps Script web app server-side and reports the real
 * outcome. The success panel appears only on a confirmed write.
 *
 * Behaviour notes:
 * - No timer and no dismissal memory. Both existed to stop an auto-opening
 *   dialog from nagging; with the modal only ever opened by a click, remembering
 *   a dismissal would instead mean the second click did nothing.
 * - Page scroll is parked with `lenis.stop()`. Lenis is not mounted at all under
 *   `prefers-reduced-motion`, so `body { overflow: hidden }` is the fallback for
 *   that case only — applying both unconditionally would shift the layout by the
 *   scrollbar width on open.
 * - `data-lenis-prevent` lets the panel scroll on a short viewport without Lenis
 *   swallowing the wheel event and scrolling the page behind it instead.
 */
export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  /** Whatever had focus before the modal took it, so it can be handed back. */
  const returnFocusRef = useRef<Element | null>(null);

  const lenis = useLenis();

  const close = useCallback(() => setOpen(false), []);

  // ── open on request from anywhere on the page ──
  useEffect(() => {
    const onRequest = () => {
      // Reset the success panel, or a second enquiry would open straight onto
      // "Thanks — that's with the desk" with no form to fill in.
      setSent(false);
      setError(null);
      setOpen(true);
    };
    window.addEventListener(CONTACT_MODAL_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(CONTACT_MODAL_REQUEST_EVENT, onRequest);
  }, []);

  // ── scroll lock + escape + focus handling while open ──
  useEffect(() => {
    if (!open) return;

    window.dispatchEvent(new Event(CONTACT_MODAL_OPEN_EVENT));

    returnFocusRef.current = document.activeElement;
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    if (!lenis) document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      // Keep Tab inside the dialog. Without this, focus walks out into the page
      // behind the backdrop, where it is invisible but still activatable.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lenis?.start();
      document.body.style.overflow = previousOverflow;
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
    };
  }, [open, lenis, close]);

  // ── entrance ──
  useEffect(() => {
    if (!open || !panelRef.current || !backdropRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power2.out" },
    );
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 26, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: reduce ? 0 : 0.5,
        ease: reduce ? "none" : "back.out(1.5)",
        onComplete: () => firstFieldRef.current?.focus(),
      },
    );
  }, [open, sent]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Captured before the await: React pools the event, and `currentTarget` is
    // null by the time the promise resolves.
    const form = event.currentTarget;

    setBusy(true);
    setError(null);

    const result = await sendEnquiry(new FormData(form));

    setBusy(false);

    // The success panel is shown only on a confirmed write. Anything else keeps
    // the form on screen with its values intact, so the visitor can retry
    // without retyping — and is never told the enquiry arrived when it did not.
    if (result.ok) {
      setSent(true);
      form.reset();
    } else {
      setError(result.error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden
        className="absolute inset-0 bg-primary/70 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        data-lenis-prevent
        className="relative max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-[14px] border border-secondary/25 bg-white p-6 shadow-[0_40px_90px_-30px_rgba(9,9,11,0.6)] sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close contact form"
          className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary"
        >
          <X size={15} strokeWidth={2.4} aria-hidden />
        </button>

        {sent ? (
          <div className="py-6 text-center">
            <span className="gold-surface mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Check size={22} strokeWidth={2.6} aria-hidden />
            </span>
            <h2
              id="contact-modal-title"
              className="mb-2.5 font-mona text-[22px] font-medium tracking-[-0.02em] text-primary"
            >
              Thanks — that&apos;s with the desk
            </h2>
            <p className="mx-auto mb-7 max-w-[380px] font-mona text-[14.5px] leading-[170%] text-text">
              A mentor will come back to you within one trading day. In the
              meantime, every package is open at no cost.
            </p>
            <div className="flex justify-center">
              <ThemeButton onClick={close} variant="secondary">
                Back to the site
              </ThemeButton>
            </div>
          </div>
        ) : (
          <>
            <span className="mb-3 inline-flex items-center gap-[5px] rounded-full border border-primary/10 px-[9px] py-[5px] font-mona text-[12px] font-medium text-primary">
              <svg width="4" height="4" viewBox="0 0 4 4" aria-hidden="true">
                <circle cx="2" cy="2" r="2" fill="#d4af37" />
              </svg>
              Talk to the desk
            </span>

            <h2
              id="contact-modal-title"
              className="gold-accents gold-accents-deep mb-2 font-mona text-[24px] leading-[125%] font-medium tracking-[-0.03em] text-primary sm:text-[27px] [&_em]:font-playfair [&_em]:font-normal [&_em]:italic"
            >
              Ask us anything before you <em>enrol</em>
            </h2>
            <p className="mb-6 font-mona text-[14px] leading-[170%] text-text">
              Tell us where you are and what you trade. A mentor will tell you
              honestly whether the programme fits — including when it does not.
            </p>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-md border border-red/20 bg-red/[0.06] px-3.5 py-2.5 font-mona text-[13px] leading-[160%] text-red"
              >
                {error}
              </p>
            )}

            <form onSubmit={submit} noValidate={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASSES} htmlFor="contact-name">
                    Your name
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={FIELD_CLASSES}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASSES} htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={FIELD_CLASSES}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASSES} htmlFor="contact-phone">
                    Phone <span className="text-text/70">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+971 …"
                    className={FIELD_CLASSES}
                  />
                </div>
              </div>

              <div className="mt-6">
                <ThemeButton
                  type="submit"
                  variant="secondary"
                  className="!w-full !justify-between"
                >
                  {busy ? "Sending…" : "Send to the desk"}
                </ThemeButton>
                <p className="mt-3 text-center font-mona text-[12px] leading-[160%] text-text">
                  We reply within one trading day. No spam, no cold calls.
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
