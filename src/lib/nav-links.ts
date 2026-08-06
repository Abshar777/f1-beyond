/**
 * Shared nav data for `Header` (desktop mega-menu / dropdowns) and
 * `MobileMenu` (off-canvas accordion).
 *
 * This is a single-route site, so every entry points at a real section anchor
 * on the page rather than the template's ~50 nonexistent page variants. The
 * ids are set on the section elements themselves (`markets`, `programmes`,
 * `packages`, `mentors`, `stories`, `notes`, `contact`), and Lenis is
 * configured with `anchors` so the jumps ease instead of snapping.
 * */

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

const BADGE_GOLD = "bg-secondary text-primary";
const BADGE_DARK = "bg-primary text-white";

/** The markets taught, split across the mega-menu's two columns. */
const marketsColumn1: NavChild[] = [
  { label: "Forex Trading", href: "#markets", badge: { text: "Popular", className: BADGE_GOLD } },
  { label: "Crypto Trading", href: "#markets", badge: { text: "Hot", className: BADGE_DARK } },
  { label: "Commodities & Metals", href: "#markets" },
  { label: "Indices & Stocks", href: "#markets" },
  { label: "Fundamentals & News", href: "#markets" },
];

const marketsColumn2: NavChild[] = [
  { label: "Technical Analysis", href: "#markets" },
  { label: "Risk Management", href: "#markets" },
  { label: "Trading Psychology", href: "#markets" },
  { label: "Algo & Automation", href: "#markets", badge: { text: "New", className: BADGE_GOLD } },
  { label: "All tracks", href: "#markets" },
];

export const NAV_LINKS: NavItem[] = [
  {
    label: "Markets",
    href: "#markets",
    children: [...marketsColumn1, ...marketsColumn2],
    megaMenu: {
      columns: [{ items: marketsColumn1 }, { items: marketsColumn2 }],
      banner: {
        heading: "Trade with the",
        accent: "Beyondpips app",
        image: {
          src: "/assets/imgs/mega-menu/mega-menu-thumb1_1.webp",
          alt: "App mockup",
        },
      },
    },
  },
  {
    label: "Programmes",
    href: "#programmes",
    children: [
      { label: "All programmes", href: "#programmes" },
      { label: "Forex foundations", href: "#programmes" },
      { label: "Crypto essentials", href: "#programmes" },
      { label: "Technical analysis", href: "#programmes" },
      { label: "Risk & psychology", href: "#programmes" },
    ],
  },
  {
    label: "Packages",
    href: "#packages",
    children: [
      { label: "Starter trader pack", href: "#packages" },
      { label: "Pro trader accelerator", href: "#packages" },
      { label: "Institutional strategy", href: "#packages" },
    ],
  },
  {
    label: "Mentors",
    href: "#mentors",
    children: [
      { label: "Meet the desk", href: "#mentors" },
      { label: "Trader stories", href: "#stories" },
      { label: "Become a mentor", href: "#contact" },
    ],
  },
 
  { label: "Contact", href: "#contact" },
];
