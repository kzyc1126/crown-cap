import type { Metadata } from "next";
import {
  Barlow,
  Barlow_Condensed,
  DM_Sans,
  DM_Serif_Display,
  IBM_Plex_Mono,
  Instrument_Serif,
  Spectral,
} from "next/font/google";
import { StyleScript, StyleSwitcher } from "@/components/layout";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
});
// Lagoon style: soft display serif + calm sans body.
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Filip’s Caps — crown cap collection",
    template: "%s — Filip’s Caps",
  },
  description:
    "A private crown cap catalogue: the collection, the wishlist and trade offers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* data-style is deliberately not rendered here: StyleScript sets it
         before paint and React must not overwrite it during hydration. */
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${instrumentSerif.variable} ${spectral.variable} ${plexMono.variable} ${dmSerif.variable} ${dmSans.variable} h-full`}
    >
      <head>
        <StyleScript />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <StyleSwitcher />
        {children}
      </body>
    </html>
  );
}
