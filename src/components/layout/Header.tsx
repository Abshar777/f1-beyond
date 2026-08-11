"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeButton from "@/components/ui/ThemeButton";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "@/lib/nav-links";
import { SMOOTH_CSS, NAV_COLLAPSE_CSS } from "@/lib/ease";

/**
 * Sticky site header — logo, desktop mega-menu nav, user/cart icons, CTA,
 * and the mobile hamburger trigger. Mirrors the source template's
 * `.header-area-2` (e-learning.html lines ~195-697):
 *  - Desktop dropdowns/mega-menu open on hover, via CSS `group-hover` —
 *    the source itself relies on plain `:hover`, so this is a direct port,
 *    no JS state needed.
 *  - Sticky-on-scroll re-implements the jQuery `pinned_header()` scroll
 *    listener (assets/js/main.js) with a plain `scroll` listener + React
 *    state instead: past the threshold the header switches from
 *    transparent/absolute-over-hero to a solid primary background + shadow.
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Shell stays full-bleed and only centres the bar; the bar itself is
          what animates, so its width transition has a stable container to
          resolve percentages against. */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center">
        <div
          style={{ transitionTimingFunction: NAV_COLLAPSE_CSS }}
          className={`transition-[width,background-color,box-shadow,border-radius,margin-top,backdrop-filter] duration-[450ms] ${
            isScrolled
              ? // collapsed: a centred floating pill clear of the page edges
                "mt-3 w-[min(1060px,calc(100%-2.5rem))] rounded-2xl bg-primary/95 shadow-[0_4px_24px_rgba(0,0,0,0.18)] backdrop-blur-md"
              : // at rest: edge-to-edge and invisible over the hero
                "mt-0 w-full rounded-none bg-transparent"
          }`}
        >
          <div
            className={`w-full transition-[padding] duration-[450ms] ${
              isScrolled ? "px-4 sm:px-5" : "px-4 sm:px-6 lg:px-8"
            }`}
          >
            <div
              style={{ transitionTimingFunction: NAV_COLLAPSE_CSS }}
              className={`mx-auto flex max-w-[1320px] items-center justify-between transition-[height] duration-[450ms] ${
                isScrolled ? "h-[62px] xl:h-[68px]" : "h-[70px] xl:h-[90px]"
              }`}
            >
            {/* Unscrolled the bar is transparent over the cream hero, so it
                needs the dark logo; once collapsed it sits on the black pill
                and switches to the light one. Both are rendered and
                cross-faded — swapping `src` would flash on first paint. */}
            <Link href="/" className="relative shrink-0">
              <img
                src="/assets/imgs/logo/logo-light.png"
                alt="Beyondpips Trading Academy"
                className={`h-7 w-auto transition-opacity duration-300 xl:h-8 ${
                  isScrolled ? "opacity-100" : "opacity-0"
                }`}
              />
              <img
                src="/assets/imgs/logo/logo-dark.png"
                alt=""
                aria-hidden
                className={`absolute inset-0 h-7 w-auto transition-opacity duration-300 xl:h-8 ${
                  isScrolled ? "opacity-0" : "opacity-100"
                }`}
                /* Backdrop shadow for the state with nothing behind it: while
                   unscrolled the bar is transparent over the cream hero, so the
                   logo has no dark pill to sit on and its edges go soft against
                   the background.

                   `drop-shadow` rather than `box-shadow` — the logo is a
                   transparent PNG, so a box shadow would outline the image's
                   rectangle instead of the artwork. Two layers: a tight one for
                   the edge and a wide, fainter one for lift.

                   It lives on this variant alone, which is why no extra state is
                   needed — the scrolled logo sits on the black pill and does not
                   want a shadow, and this copy is already faded out by then. */
                style={{
                  filter:
                    "drop-shadow(0 1px 2px rgba(9,9,11,0.22)) drop-shadow(0 6px 14px rgba(9,9,11,0.13))",
                }}
              />
            </Link>

            {/* desktop nav + icons + CTA */}
            <div className="hidden h-full items-center gap-6 xl:flex 2xl:gap-10">
              <nav className="h-full">
                <ul className="flex h-full items-center gap-8 2xl:gap-10">
                  {NAV_LINKS.map((item) => {
                    const hasDropdown = Boolean(item.megaMenu || item.children?.length);
                    return (
                      <li key={item.label} className="group relative h-full">
                        {/* In-page anchors stay plain <a>: next/link would
                            route them through the App Router and Lenis would
                            never see the click, losing the eased scroll. */}
                        {item.href.startsWith("#") ? (
                          <a href={item.href} className={navLinkClass(isScrolled)}>
                            <NavLabel label={item.label} />
                            {hasDropdown && <ChevronIcon />}
                          </a>
                        ) : (
                          <Link href={item.href} className={navLinkClass(isScrolled)}>
                            <NavLabel label={item.label} />
                            {hasDropdown && <ChevronIcon />}
                          </Link>
                        )}

                        {/* mega-menu (Home) */}
                        {item.megaMenu && (
                          <div
                            style={{ transitionTimingFunction: SMOOTH_CSS }}
                            className="invisible absolute left-0 top-full z-20 flex w-[760px] max-w-[85vw] origin-top-left -translate-y-3 scale-[0.97] gap-6 overflow-hidden rounded-xl bg-white p-3 opacity-0 shadow-2xl transition-[opacity,transform,visibility] duration-[550ms] group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100"
                          >
                            <div className="flex min-w-0 flex-1 gap-10 p-6">
                              {item.megaMenu.columns.map((col, i) => (
                                <ul key={i} className="flex min-w-[170px] flex-col">
                                  {col.items.map((link) => (
                                    <li key={link.label}>
                                      <a
                                        href={link.href}
                                        className="flex items-center py-3 font-mona text-sm font-medium capitalize text-primary transition-all duration-300 hover:tracking-wide hover:text-secondary"
                                      >
                                        {link.label}
                                        {link.badge && (
                                          <span
                                            className={`ml-3 rounded-sm px-[6.5px] py-[3px] font-mona text-xs font-medium capitalize ${link.badge.className}`}
                                          >
                                            {link.badge.text}
                                          </span>
                                        )}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ))}
                            </div>
                            <div className="relative flex w-[39%] min-w-0 shrink-0 flex-col overflow-hidden rounded-md bg-primary p-4">
                              <div className="flex min-w-0 items-center justify-center overflow-hidden rounded-md bg-ink pt-4">
                                <img
                                  src={item.megaMenu.banner.image.src}
                                  alt={item.megaMenu.banner.image.alt}
                                  className="h-auto max-h-[170px] w-auto max-w-[85%] object-contain"
                                />
                              </div>
                              <div className="mt-4 flex min-w-0 flex-col items-start gap-4">
                                <p className="font-mona text-xl leading-tight font-medium text-white">
                                  {item.megaMenu.banner.heading}{" "}
                                  <span className="font-playfair text-xl text-secondary italic">
                                    {item.megaMenu.banner.accent}
                                  </span>
                                </p>
                                <div className="flex w-full flex-col items-stretch gap-2.5">
                                  <span className="rounded-md bg-black/40 px-3 py-2 text-center font-mona text-xs font-medium text-white">
                                    Google Play
                                  </span>
                                  <span className="rounded-md bg-black/40 px-3 py-2 text-center font-mona text-xs font-medium text-white">
                                    App Store
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* simple dropdown (Courses / Instructors / Pages / Blog) */}
                        {!item.megaMenu && item.children && item.children.length > 0 && (
                          <ul
                            style={{ transitionTimingFunction: SMOOTH_CSS }}
                            className="invisible absolute left-0 top-full z-20 w-[260px] origin-top -translate-y-3 rounded-md bg-white py-4 opacity-0 shadow-2xl transition-[opacity,transform,visibility] duration-[550ms] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                          >
                            {item.children.map((link, linkIndex) => (
                              <li
                                key={link.label}
                                style={{
                                  transitionTimingFunction: SMOOTH_CSS,
                                  transitionDelay: `${80 + linkIndex * 45}ms`,
                                }}
                                className="translate-x-2 px-6 opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
                              >
                                <a
                                  href={link.href}
                                  className="flex items-center justify-between py-2.5 font-mona text-sm font-medium capitalize text-primary transition-all duration-300 hover:tracking-wide hover:text-secondary"
                                >
                                  {link.label}
                                  {link.badge && (
                                    <span
                                      className={`ml-3 rounded-sm px-[6.5px] py-[3px] font-mona text-xs font-medium capitalize ${link.badge.className}`}
                                    >
                                      {link.badge.text}
                                    </span>
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* <a
                href="#"
                aria-label="Account"
                className={`flex items-center border-r pr-5 transition-colors duration-300 ${isScrolled ? "border-white/15 text-white" : "border-primary/15 text-primary"}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.01921 14.4102C5.72754 13.8847 6.49921 13.4696 7.33421 13.165C8.16907 12.8606 9.05768 12.7083 10 12.7083C10.9424 12.7083 11.831 12.8606 12.6659 13.165C13.5009 13.4696 14.2725 13.8847 14.9809 14.4102C15.4989 13.8408 15.9094 13.1816 16.2123 12.4327C16.5152 11.6838 16.6667 10.8729 16.6667 10C16.6667 8.15278 16.0174 6.57986 14.7188 5.28125C13.4202 3.98264 11.8473 3.33334 10 3.33334C8.15282 3.33334 6.5799 3.98264 5.28129 5.28125C3.98268 6.57986 3.33337 8.15278 3.33337 10C3.33337 10.8729 3.48483 11.6838 3.78775 12.4327C4.09067 13.1816 4.50115 13.8408 5.01921 14.4102ZM10.0002 10.625C9.23942 10.625 8.59782 10.3639 8.07546 9.84167C7.55296 9.31931 7.29171 8.67771 7.29171 7.91688C7.29171 7.15604 7.55282 6.51445 8.07504 5.99209C8.5974 5.46959 9.239 5.20834 9.99983 5.20834C10.7607 5.20834 11.4023 5.46945 11.9246 5.99167C12.4471 6.51403 12.7084 7.15563 12.7084 7.91646C12.7084 8.67729 12.4473 9.31889 11.925 9.84125C11.4027 10.3638 10.7611 10.625 10.0002 10.625ZM10 17.9167C8.90073 17.9167 7.86948 17.7099 6.90629 17.2965C5.9431 16.883 5.10525 16.3199 4.39275 15.6073C3.68011 14.8948 3.11705 14.0569 2.70358 13.0938C2.29011 12.1306 2.08337 11.0993 2.08337 10C2.08337 8.9007 2.29011 7.86945 2.70358 6.90625C3.11705 5.94306 3.68011 5.10521 4.39275 4.39271C5.10525 3.68007 5.9431 3.11702 6.90629 2.70354C7.86948 2.29007 8.90073 2.08334 10 2.08334C11.0993 2.08334 12.1306 2.29007 13.0938 2.70354C14.057 3.11702 14.8948 3.68007 15.6073 4.39271C16.32 5.10521 16.883 5.94306 17.2965 6.90625C17.71 7.86945 17.9167 8.9007 17.9167 10C17.9167 11.0993 17.71 12.1306 17.2965 13.0938C16.883 14.0569 16.32 14.8948 15.6073 15.6073C14.8948 16.3199 14.057 16.883 13.0938 17.2965C12.1306 17.7099 11.0993 17.9167 10 17.9167ZM10 16.6667C10.7521 16.6667 11.4773 16.5457 12.1755 16.3038C12.8737 16.0617 13.4936 15.7233 14.0352 15.2885C13.4936 14.8697 12.8817 14.5433 12.1996 14.3094C11.5174 14.0753 10.7842 13.9583 10 13.9583C9.21587 13.9583 8.48136 14.074 7.7965 14.3052C7.11164 14.5366 6.50108 14.8644 5.96483 15.2885C6.5065 15.7233 7.12643 16.0617 7.82462 16.3038C8.52282 16.5457 9.24796 16.6667 10 16.6667ZM10 9.375C10.4146 9.375 10.7613 9.23556 11.04 8.95667C11.3189 8.67792 11.4584 8.33125 11.4584 7.91667C11.4584 7.50209 11.3189 7.15542 11.04 6.87667C10.7613 6.59778 10.4146 6.45834 10 6.45834C9.58546 6.45834 9.23879 6.59778 8.96004 6.87667C8.68115 7.15542 8.54171 7.50209 8.54171 7.91667C8.54171 8.33125 8.68115 8.67792 8.96004 8.95667C9.23879 9.23556 9.58546 9.375 10 9.375Z"
                    fill="currentColor"
                  />
                </svg>
              </a>

              <a href="#" aria-label="Cart" className={`relative flex items-center transition-colors duration-300 ${isScrolled ? "text-white" : "text-primary"}`}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.96146 17.9648C5.5566 17.9648 5.21236 17.8229 4.92875 17.5392C4.64514 17.2556 4.50333 16.9113 4.50333 16.5065C4.50333 16.1015 4.64514 15.7572 4.92875 15.4735C5.21236 15.1899 5.5566 15.0481 5.96146 15.0481C6.36646 15.0481 6.71076 15.1899 6.99438 15.4735C7.27799 15.7572 7.41979 16.1015 7.41979 16.5065C7.41979 16.9113 7.27799 17.2556 6.99438 17.5392C6.71076 17.8229 6.36646 17.9648 5.96146 17.9648ZM14.0385 17.9648C13.6335 17.9648 13.2892 17.8229 13.0056 17.5392C12.722 17.2556 12.5802 16.9113 12.5802 16.5065C12.5802 16.1015 12.722 15.7572 13.0056 15.4735C13.2892 15.1899 13.6335 15.0481 14.0385 15.0481C14.4434 15.0481 14.7876 15.1899 15.0712 15.4735C15.3549 15.7572 15.4967 16.1015 15.4967 16.5065C15.4967 16.9113 15.3549 17.2556 15.0712 17.5392C14.7876 17.8229 14.4434 17.9648 14.0385 17.9648ZM5.01271 4.79167L7.125 9.21479H12.806C12.8541 9.21479 12.8969 9.20278 12.9344 9.17875C12.9717 9.15472 13.0038 9.12132 13.0304 9.07854L15.266 5.01604C15.2981 4.95729 15.3008 4.90521 15.274 4.85979C15.2473 4.81438 15.2019 4.79167 15.1377 4.79167H5.01271ZM4.41354 3.54167H15.984C16.3248 3.54167 16.5825 3.68674 16.7571 3.97688C16.9318 4.26688 16.9401 4.56306 16.7821 4.86542L14.1121 9.70188C13.9754 9.94229 13.7947 10.1295 13.5698 10.2635C13.3448 10.3977 13.0983 10.4648 12.8302 10.4648H6.75L5.78521 12.2275C5.74243 12.2917 5.74111 12.3611 5.78125 12.4358C5.82125 12.5107 5.88132 12.5481 5.96146 12.5481H15.4967V13.7981H5.96146C5.4059 13.7981 4.98847 13.5585 4.70917 13.0794C4.42972 12.6002 4.41986 12.1218 4.67958 11.6442L5.86854 9.50646L2.83667 3.125H1.25V1.875H3.62188L4.41354 3.54167Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="absolute -top-1.5 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-secondary text-[10px] leading-none font-semibold text-white">
                  2
                </span>
              </a> */}

              <ThemeButton href="/" variant="secondary">
                Enroll now
              </ThemeButton>
            </div>

            {/* mobile hamburger trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={`flex h-11 w-11 items-center justify-center transition-colors duration-300 xl:hidden ${isScrolled ? "text-white" : "text-primary"}`}
            >
              <HamburgerIcon />
            </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

// Full-height rather than a fixed vertical padding, so the hit area (and the
// dropdown's `top-full` anchor) track the bar as it collapses. Colour depends
// on what's behind the bar: cream hero when unscrolled, black pill once
// collapsed.
const navLinkClass = (scrolled: boolean) =>
  `flex h-full items-center gap-1.5 font-mona text-sm font-medium capitalize transition-colors duration-300 group-hover:text-secondary ${
    scrolled ? "text-white" : "text-primary"
  }`;

/**
 * Label with an underline that wipes in from the left on hover and, on the way
 * out, retracts to the right rather than reversing — so the rule always
 * travels with the cursor instead of rewinding.
 */
function NavLabel({ label }: { label: string }) {
  return (
    <span className="relative inline-block">
      {label}
      <span
        style={{ transitionTimingFunction: SMOOTH_CSS }}
        className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-secondary transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100"
      />
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      className="mt-px shrink-0 transition-transform duration-300 group-hover:rotate-180"
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

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 1H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 8H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 15H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
