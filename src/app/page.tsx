
/**
 * Home Page — /
 *
 * The public-facing homepage for Youth Access Hub.
 * All data fetching happens here (server component) and is passed
 * as props into section components — no section fetches its own data.
 *
 * Section order:
 *  1. Hero            — headline, CTAs, visual
 *  2. StatsBar        — impact numbers
 *  3. HowItWorks      — 3-step process
 *  4. ProgramsGrid    — featured mentorship programs
 *  5. CTABanner       — dual CTA for youth + partners/mentors
 *
 * Render strategy: SSG (static site generation at build time).
 * No dynamic params — revalidate on content change via Sanity webhooks in Phase 2.
 *
 * @module app/page
 */

import type { Metadata } from "next";
import { getFeaturedPrograms, getOpportunities } from "@/lib/getData";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import HowItWorks from "@/components/sections/HowItWorks";
import ProgramsGrid from "@/components/sections/ProgramsGrid";
import CTABanner from "@/components/sections/CTABanner";

// ─── Page Metadata ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Youth Access Hub — Empowering Youth, Opening Opportunities",
  description:
    "Youth Access Hub connects young people in Zimbabwe to mentorship programs, career opportunities, internships, and a powerful network of partner organisations.",
};

// ─── Page Component ────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch featured programs and opportunities server-side in parallel
  const [featuredPrograms, opportunities] = await Promise.all([
    getFeaturedPrograms(),
    getOpportunities(),
  ]);

  const activeOpportunitiesCount = opportunities.filter((o) => o.status === "open").length;

  return (
    <>
      <Hero />
      <StatsBar activeOpportunitiesCount={activeOpportunitiesCount} />
      <HowItWorks />
      <ProgramsGrid programs={featuredPrograms} />
      <CTABanner />
    </>
  );
}
