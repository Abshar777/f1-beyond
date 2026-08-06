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

export const metadata: Metadata = {
  title: "Beyondpips Trading Academy — Learn to trade crypto, forex & commodities",
  description:
    "Live market sessions, chart reading and practical risk management taught by active traders. Real charts, real strategies, real practice.",
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
