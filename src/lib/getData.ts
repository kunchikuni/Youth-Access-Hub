/**
 * Data abstraction layer
 *
 * ALL data access in the application goes through this file.
 * Components and pages NEVER import from src/data/ directly.
 *
 * Phase 1: Returns static TypeScript data.
 * Phase 2: Replace function bodies with Sanity GROQ queries.
 *          Zero component changes required.
 *
 * All functions are async to ensure the Sanity migration is a drop-in swap.
 *
 * @module lib/getData
 */

import type { Program } from "@/types/program";
import type { Opportunity } from "@/types/opportunity";
import type { Partner } from "@/types/partner";

import { programs } from "@/data/programs";
import { opportunities } from "@/data/opportunities";
import { partners } from "@/data/partners";

// ─── Programs ────────────────────────────────────────────────────────────────

/**
 * Returns all programs.
 */
export async function getPrograms(): Promise<Program[]> {
  return programs;
}

/**
 * Returns only programs marked as featured.
 * Used on the homepage ProgramsGrid section.
 */
export async function getFeaturedPrograms(): Promise<Program[]> {
  return programs.filter((p) => p.featured);
}

/**
 * Returns a single program by its slug.
 * Returns undefined if not found — callers should handle 404.
 *
 * @param slug - URL slug identifier
 */
export async function getProgramBySlug(
  slug: string
): Promise<Program | undefined> {
  return programs.find((p) => p.slug === slug);
}

/**
 * Returns all program slugs.
 * Used by Next.js generateStaticParams for /programs/[slug].
 */
export async function getProgramSlugs(): Promise<string[]> {
  return programs.map((p) => p.slug);
}

// ─── Opportunities ────────────────────────────────────────────────────────────

/**
 * Returns all opportunities.
 */
export async function getOpportunities(): Promise<Opportunity[]> {
  return opportunities;
}

/**
 * Returns only opportunities marked as featured.
 * Used on the homepage OpportunitiesGrid section.
 */
export async function getFeaturedOpportunities(): Promise<Opportunity[]> {
  return opportunities.filter((o) => o.featured);
}

/**
 * Returns a single opportunity by its slug.
 * Returns undefined if not found — callers should handle 404.
 *
 * @param slug - URL slug identifier
 */
export async function getOpportunityBySlug(
  slug: string
): Promise<Opportunity | undefined> {
  return opportunities.find((o) => o.slug === slug);
}

/**
 * Returns all opportunity slugs.
 * Used by Next.js generateStaticParams for /opportunities/[slug].
 */
export async function getOpportunitySlugs(): Promise<string[]> {
  return opportunities.map((o) => o.slug);
}

// ─── Partners ─────────────────────────────────────────────────────────────────

/**
 * Returns all partners.
 */
export async function getPartners(): Promise<Partner[]> {
  return partners;
}

/**
 * Returns only partners marked as featured.
 */
export async function getFeaturedPartners(): Promise<Partner[]> {
  return partners.filter((p) => p.featured);
}

/**
 * Returns a single partner by its slug.
 * Returns undefined if not found.
 *
 * @param slug - URL slug identifier
 */
export async function getPartnerBySlug(
  slug: string
): Promise<Partner | undefined> {
  return partners.find((p) => p.slug === slug);
}
