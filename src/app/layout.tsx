import type { Metadata } from "next";
import {
  Mona_Sans,
  Playfair_Display,
  DM_Sans,
  Instrument_Serif,
  Forum,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const forum = Forum({
  variable: "--font-forum",
  weight: "400",
  subsets: ["latin"],
});

/**
 * The production origin. `metadataBase` is what turns the relative OG/icon paths
 * into the absolute URLs that social scrapers require — without it Next warns
 * and falls back to localhost, and the share card silently resolves to nothing.
 *
 * `www` deliberately, and no trailing slash. The apex 308-redirects to `www`, so
 * naming the apex here would put a redirect in front of every canonical and OG
 * URL — which some scrapers do not follow, and which costs a round trip for the
 * ones that do.
 */
const SITE_URL = "https://www.beyondpipsacademy.com";

const DESCRIPTION =
  "Learn to trade forex, crypto, indices and metals with active traders. Live mentor sessions, real chart reading and the risk framework that keeps an account alive. Every package is free while the desk is opening up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `%s` is filled by each route's own `title`; the homepage overrides with
  // `absolute` via `default`, so it does not read "Home | Beyondpips…".
  title: {
    default:
      "Beyondpips Trading Academy — learn forex, crypto & commodities in Dubai",
    template: "%s | Beyondpips Trading Academy",
  },
  description: DESCRIPTION,
  applicationName: "Beyondpips Trading Academy",
  keywords: [
    "trading academy Dubai",
    "forex course",
    "crypto trading course",
    "pip calculator",
    "position sizing",
    "risk management",
    "trading mentor",
  ],
  authors: [{ name: "Beyondpips Trading Academy" }],
  creator: "Beyondpips Trading Academy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Beyondpips Trading Academy",
    title:
      "Beyondpips Trading Academy — learn forex, crypto & commodities in Dubai",
    description: DESCRIPTION,
    url: "/",
    locale: "en_GB",
    // src/app/opengraph-image.png is picked up automatically and gets the
    // fingerprinted URL; listing it by hand here would bypass that.
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Beyondpips Trading Academy — learn forex, crypto & commodities in Dubai",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  // icon.png / apple-icon.png in src/app are wired up by the file convention,
  // so `icons` is deliberately not declared.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${playfairDisplay.variable} ${dmSans.variable} ${instrumentSerif.variable} ${forum.variable}`}
    >
      <body className="body-wrapper">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
