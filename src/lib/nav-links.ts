/**
 * Shared nav data for `Header` (desktop bar) and `MobileMenu` (off-canvas list).
 *
 * Flat by design — no dropdowns and no mega menu. The previous version carried a
 * nine-item Markets mega menu with an app-store promo panel for an app that does
 * not exist; every entry now goes straight to a real destination.
 *
 * Two kinds of destination: root-relative anchors into the homepage's sections
 * (`/#markets`) and the standalone routes `/pip-calculator` and `/blog`. The
 * anchors must keep their leading `/` — a bare `#markets` resolves against
 * whatever route the reader is on, so it silently does nothing from a subpage.
 * The ids live on the section elements themselves (`markets`, `who-we-are`,
 * `vision-mission`, `faq`, `packages`, `pip-calculator`, `stories`, `notes`,
 * `contact`), and Lenis is configured with `anchors` so same-page jumps ease
 * instead of snapping.
 *
 * `children` and `megaMenu` stay on the type because `Header` and `MobileMenu`
 * still know how to render them — adding a `children` array to any item below
 * brings its dropdown back without touching either component.
 */

export type NavBadge = {
  text: string;
  /** Tailwind bg/text classes — mirrors the source's badge colour variants. */
  className: string;
};

export type NavChild = {
  label: string;
  href: string;
  badge?: NavBadge;
};

export type NavColumn = {
  items: NavChild[];
};

export type MegaMenuBanner = {
  heading: string;
  accent: string;
  image: { src: string; alt: string };
};

export type NavItem = {
  label: string;
  href: string;
  /** Flat link list — simple desktop dropdowns and the mobile accordion. */
  children?: NavChild[];
  /** Two-column + promo-banner layout — desktop only. */
  megaMenu?: {
    columns: NavColumn[];
    banner: MegaMenuBanner;
  };
};

export const NAV_LINKS: NavItem[] = [
   { label: "About", href: "/#who-we-are" },
  { label: "Market Notes", href: "/blog" },
  { label: "Pricing", href: "/#packages" },
  { label: "Pip Calculator", href: "/pip-calculator" },
  // { label: "Contact", href: "/#contact" },
];
