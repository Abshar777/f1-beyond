"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav-links";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  whatsappHref,
} from "@/lib/contact";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Off-canvas mobile nav — mirrors the source template's "side toggle"
 * (e-learning.html lines 63-121: `.side-info` / `.offcanvas-overlay`).
 *
 * The source drives open/close by toggling `.info-open` / `.overlay-open`
 * classes via jQuery (assets/js/main.js `[05] Side Info / Offcanvas`); here
 * that's a plain `open` prop from `Header`, translated into Tailwind
 * translate-x / opacity transition classes. The accordion sub-menus replace
 * the source's MeanMenu plugin (which clones `.main-menu` into the empty
 * `.mobile-menu` placeholder at runtime) with a small `expanded` state array
 * built straight from the shared `NAV_LINKS` data.
 */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const toggle = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* panel */}
      <aside
        inert={!open}
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 right-0 z-[999] h-full w-full max-w-[420px] overflow-y-auto border-l border-white/30 bg-white/95 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative min-h-full pb-28">
          {/* logo + close */}
          <div className="flex items-center justify-between p-6 sm:p-8">
            <Link href="/" onClick={onClose} className="w-24 shrink-0">
              <img src="/assets/imgs/logo/logo-dark.png" alt="Beyondpips Trading Academy" className="w-full" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-primary transition-all duration-300 hover:rotate-90 hover:bg-primary hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          {/* intro */}
          <div className="px-6 pb-6 sm:px-8">
            <h2 className="mb-3 font-mona text-2xl font-bold text-black">Hello There!</h2>
            <p className="text-sm leading-relaxed text-text">
              We offer comprehensive range of services to help your business thrive.
            </p>
          </div>

          {/* accordion nav */}
          <nav className="px-6 sm:px-8">
            <ul className="w-full list-none">
              {NAV_LINKS.map((item) => {
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isOpen = expanded.includes(item.label);

                return (
                  <li key={item.label} className="border-t border-black/10 last:border-b">
                    <div className="flex items-center justify-between">
                      {/* Hash links stay plain <a> so Lenis handles the eased
                          scroll; next/link would route them instead. */}
                      {item.href.startsWith("#") ? (
                        <a
                          href={item.href}
                          onClick={onClose}
                          className="flex-1 py-3.5 font-mona text-sm font-normal capitalize text-secondary"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex-1 py-3.5 font-mona text-sm font-normal capitalize text-secondary"
                        >
                          {item.label}
                        </Link>
                      )}

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggle(item.label)}
                          aria-expanded={isOpen}
                          aria-label={`Toggle ${item.label} submenu`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center text-primary"
                        >
                          <ChevronIcon open={isOpen} />
                        </button>
                      )}
                    </div>

                    {hasChildren && (
                      <div
                        inert={!isOpen}
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <ul className="overflow-hidden">
                          {item.children!.map((child) => (
                            <li key={child.label} className="border-t border-black/10 first:border-t-0">
                              <a
                                href={child.href}
                                onClick={onClose}
                                className="flex items-center gap-2 py-3 pl-4 font-mona text-[15px] capitalize text-primary"
                              >
                                {child.label}
                                {child.badge && (
                                  <span
                                    className={`rounded-sm px-[6.5px] py-[3px] text-[10px] font-medium capitalize ${child.badge.className}`}
                                  >
                                    {child.badge.text}
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* information */}
          <div className="px-6 pt-8 pb-2 sm:px-8">
            <h3 className="relative mb-4 inline-block pb-1 font-mona text-lg font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[30px] after:bg-primary after:content-['']">
              Information
            </h3>
            <div className="flex flex-col gap-2 text-sm text-text">
              {/* The template shipped a Mauritius phone number and a Lisbon
                  street address here, both of which contradicted the site's own
                  copy. Removed rather than replaced with another invention. */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="transition-colors duration-300 hover:text-primary"
              >
                {CONTACT_EMAIL}
              </a>
              <span>{CONTACT_LOCATION}</span>
            </div>
          </div>

          {/* contact */}
          <div className="px-6 py-8 sm:px-8">
            <h3 className="relative mb-4 inline-block pb-1 font-mona text-lg font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[30px] after:bg-primary after:content-['']">
              Talk To Us
            </h3>
            {/* Was four "#" placeholders labelled FB/LN/IN/BE. One working
                destination beats four dead ones; add the real social handles
                back when there are real handles. */}
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#25d366] px-4 py-2.5 font-mona text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.371-.03-.52-.087-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* footer watermark */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent px-6 pt-10 pb-8 sm:px-8">
            <img
              src="/assets/imgs/logo/logo-dark.png"
              alt=""
              className="w-28 opacity-70"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 1L15 15M15 1L1 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
