/**
 * Data abstraction layer
 * Phase 2: Supabase backend — all reads go through this module.
 * Function signatures are identical to Phase 1 — no component changes required.
 *
 * @module lib/getData
 */

import { createClient } from "@/lib/supabase/server";
import type { Program, Mentor } from "@/types/program";
import type { Opportunity } from "@/types/opportunity";
import type { Partner } from "@/types/partner";
import { programs as fallbackPrograms } from "@/data/programs";
import { opportunities as fallbackOpportunities } from "@/data/opportunities";
import { partners as fallbackPartners } from "@/data/partners";

// ─── Row shapes returned by Supabase ─────────────────────────────────────────
// Supabase returns snake_case columns — we map to camelCase TypeScript types.

interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: Program["category"];
  status: Program["status"];
  duration: string;
  audience: string;
  outcomes: string[];
  mentors: Mentor[];
  featured: boolean;
  cover_image: string | null;
  start_date: string | null;
  partner: string | null;
  created_at: string;
  updated_at: string;
}

interface OpportunityRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: Opportunity["category"];
  status: Opportunity["status"];
  provider: string;
  location: string;
  audience: string;
  eligibility: string[];
  how_to_apply: string;
  featured: boolean;
  cover_image: string | null;
  deadline: string | null;
  apply_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PartnerRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: Partner["type"];
  contribution: string;
  featured: boolean;
  logo: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Mappers: DB row → TypeScript type ───────────────────────────────────────

function mapProgram(row: ProgramRow): Program {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    status: row.status,
    duration: row.duration,
    audience: row.audience,
    outcomes: row.outcomes ?? [],
    mentors: row.mentors ?? [],
    featured: row.featured,
    ...(row.cover_image && { coverImageUrl: row.cover_image }),
    ...(row.start_date && { startDate: row.start_date }),
    ...(row.partner && { partner: row.partner }),
  };
}

function mapOpportunity(row: OpportunityRow): Opportunity {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    status: row.status,
    provider: row.provider,
    location: row.location,
    audience: row.audience,
    eligibility: row.eligibility ?? [],
    howToApply: row.how_to_apply,
    featured: row.featured,
    ...(row.deadline && { deadline: row.deadline }),
    ...(row.apply_url && { applyUrl: row.apply_url }),
  };
}

function mapPartner(row: PartnerRow): Partner {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    type: row.type,
    contribution: row.contribution,
    featured: row.featured,
    ...(row.logo && { logo: row.logo }),
    ...(row.website && { website: row.website }),
  };
}

// ─── Programs ─────────────────────────────────────────────────────────────────

/**
 * Returns all programs.
 */
export async function getPrograms(): Promise<Program[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPrograms;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getPrograms error:", error.message);
      return fallbackPrograms;
    }

    return (data as ProgramRow[]).map(mapProgram);
  } catch (err) {
    console.error("[getData] getPrograms failed to execute, falling back to static data:", err);
    return fallbackPrograms;
  }
}

/**
 * Returns only programs marked as featured.
 * Used on the homepage ProgramsGrid section.
 */
export async function getFeaturedPrograms(): Promise<Program[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPrograms.filter((p) => p.featured);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getFeaturedPrograms error:", error.message);
      return fallbackPrograms.filter((p) => p.featured);
    }

    return (data as ProgramRow[]).map(mapProgram);
  } catch (err) {
    console.error("[getData] getFeaturedPrograms failed to execute, falling back to static data:", err);
    return fallbackPrograms.filter((p) => p.featured);
  }
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
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPrograms.find((p) => p.slug === slug);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
      if (error.code === "PGRST116") return undefined; // row not found
      console.error("[getData] getProgramBySlug error:", error.message);
      return fallbackPrograms.find((p) => p.slug === slug);
    }

    return mapProgram(data as ProgramRow);
  } catch (err) {
    console.error("[getData] getProgramBySlug failed to execute, falling back to static data:", err);
    return fallbackPrograms.find((p) => p.slug === slug);
  }
}

/**
 * Returns all program slugs.
 * Used by Next.js generateStaticParams for /programs/[slug].
 */
export async function getProgramSlugs(): Promise<string[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPrograms.map((p) => p.slug);
    }
    const supabase = await createClient();
    const { data, error } = await supabase.from("programs").select("slug");

    if (error) {
      console.error("[getData] getProgramSlugs error:", error.message);
      return fallbackPrograms.map((p) => p.slug);
    }

    return data.map((row: { slug: string }) => row.slug);
  } catch (err) {
    console.error("[getData] getProgramSlugs failed to execute, falling back to static data:", err);
    return fallbackPrograms.map((p) => p.slug);
  }
}

// ─── Opportunities ────────────────────────────────────────────────────────────

/**
 * Returns all opportunities.
 */
export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackOpportunities;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getOpportunities error:", error.message);
      return fallbackOpportunities;
    }

    return (data as OpportunityRow[]).map(mapOpportunity);
  } catch (err) {
    console.error("[getData] getOpportunities failed to execute, falling back to static data:", err);
    return fallbackOpportunities;
  }
}

/**
 * Returns only opportunities marked as featured.
 * Used on the homepage OpportunitiesGrid section.
 */
export async function getFeaturedOpportunities(): Promise<Opportunity[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackOpportunities.filter((o) => o.featured);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getFeaturedOpportunities error:", error.message);
      return fallbackOpportunities.filter((o) => o.featured);
    }

    return (data as OpportunityRow[]).map(mapOpportunity);
  } catch (err) {
    console.error("[getData] getFeaturedOpportunities failed to execute, falling back to static data:", err);
    return fallbackOpportunities.filter((o) => o.featured);
  }
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
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackOpportunities.find((o) => o.slug === slug);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      console.error("[getData] getOpportunityBySlug error:", error.message);
      return fallbackOpportunities.find((o) => o.slug === slug);
    }

    return mapOpportunity(data as OpportunityRow);
  } catch (err) {
    console.error("[getData] getOpportunityBySlug failed to execute, falling back to static data:", err);
    return fallbackOpportunities.find((o) => o.slug === slug);
  }
}

/**
 * Returns all opportunity slugs.
 * Used by Next.js generateStaticParams for /opportunities/[slug].
 */
export async function getOpportunitySlugs(): Promise<string[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackOpportunities.map((o) => o.slug);
    }
    const supabase = await createClient();
    const { data, error } = await supabase.from("opportunities").select("slug");

    if (error) {
      console.error("[getData] getOpportunitySlugs error:", error.message);
      return fallbackOpportunities.map((o) => o.slug);
    }

    return data.map((row: { slug: string }) => row.slug);
  } catch (err) {
    console.error("[getData] getOpportunitySlugs failed to execute, falling back to static data:", err);
    return fallbackOpportunities.map((o) => o.slug);
  }
}

// ─── Partners ─────────────────────────────────────────────────────────────────

/**
 * Returns all partners.
 */
export async function getPartners(): Promise<Partner[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPartners;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getPartners error:", error.message);
      return fallbackPartners;
    }

    return (data as PartnerRow[]).map(mapPartner);
  } catch (err) {
    console.error("[getData] getPartners failed to execute, falling back to static data:", err);
    return fallbackPartners;
  }
}

/**
 * Returns only partners marked as featured.
 */
export async function getFeaturedPartners(): Promise<Partner[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPartners.filter((p) => p.featured);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false });

    if (error) {
      console.error("[getData] getFeaturedPartners error:", error.message);
      return fallbackPartners.filter((p) => p.featured);
    }

    return (data as PartnerRow[]).map(mapPartner);
  } catch (err) {
    console.error("[getData] getFeaturedPartners failed to execute, falling back to static data:", err);
    return fallbackPartners.filter((p) => p.featured);
  }
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
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("[getData] Supabase credentials missing. Falling back to static data.");
      return fallbackPartners.find((p) => p.slug === slug);
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      console.error("[getData] getPartnerBySlug error:", error.message);
      return fallbackPartners.find((p) => p.slug === slug);
    }

    return mapPartner(data as PartnerRow);
  } catch (err) {
    console.error("[getData] getPartnerBySlug failed to execute, falling back to static data:", err);
    return fallbackPartners.find((p) => p.slug === slug);
  }
}