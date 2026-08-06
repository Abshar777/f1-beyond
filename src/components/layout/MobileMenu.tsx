"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav-links";

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
              <a href="tel:+22306965119" className="transition-colors duration-300 hover:text-primary">
                +2230 6965 119
              </a>
              <a
                href="mailto:hello@beyondpips.com"
                className="transition-colors duration-300 hover:text-primary"
              >
                hello@beyondpips.com
              </a>
              <span>Avenue de Roma 1588, Lisboa</span>
            </div>
          </div>

          {/* social */}
          <div className="px-6 py-8 sm:px-8">
            <h3 className="relative mb-4 inline-block pb-1 font-mona text-lg font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[30px] after:bg-primary after:content-['']">
              Connect Us On
            </h3>
            <div className="flex gap-3">
              {["FB", "LN", "IN", "BE"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-xs font-medium text-black transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
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
