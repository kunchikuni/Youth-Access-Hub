/**
 * Root Layout
 *
 * Applied to every page in the application.
 * Responsibilities:
 *  - Load and inject Google Fonts (Poppins + Inter) via next/font — zero layout shift
 *  - Set global HTML metadata (title template, description, OG tags)
 *  - Wrap all pages with Navbar and Footer
 *  - Apply global CSS tokens via globals.css
 *
 * @module app/layout
 */

import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Font Configuration ────────────────────────────────────────────────────

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// ─── Site Metadata ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    template: "%s | Youth Access Hub",
    default: "Youth Access Hub — Empowering Youth, Opening Opportunities",
  },
  description:
    "Youth Access Hub connects young people in Zimbabwe to mentorship programs, growth opportunities, and a network of partner organisations. Your gateway to education, work, and personal development.",
  keywords: [
    "youth",
    "mentorship",
    "Zimbabwe",
    "opportunities",
    "education",
    "career",
    "internship",
    "youth development",
    "Harare",
  ],
  authors: [{ name: "Youth Access Hub" }],
  creator: "Youth Access Hub",
  openGraph: {
    type: "website",
    locale: "en_ZW",
    siteName: "Youth Access Hub",
    title: "Youth Access Hub — Empowering Youth, Opening Opportunities",
    description:
      "Connecting young people to mentorship, opportunities, and support through strong cross-sector partnerships.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Youth Access Hub",
    description: "Empowering Youth, Opening Opportunities",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Layout Component ──────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
