"use server";

/**
 * Opportunity Server Actions
 *
 * All database writes for opportunities go through here — never from
 * the browser directly. Each action:
 *  1. Verifies the user is authenticated
 *  2. Performs the Supabase mutation using the server client
 *  3. Calls revalidatePath() so affected public pages regenerate immediately
 *  4. Returns a typed result object — never throws — so the client
 *     can handle success and error states cleanly
 *
 * @module actions/opportunities
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/types/opportunity";

// ─── Result type ──────────────────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─── Paths to revalidate after any opportunity mutation ───────────────────────

function revalidateOpportunityPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/opportunities");
  if (slug) revalidatePath(`/opportunities/${slug}`);
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorised");
  return { supabase, user };
}

// ─── Payload shape shared by create and update ────────────────────────────────

export interface OpportunityPayload {
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
  howToApply: string;
  featured: boolean;
  coverImageUrl: string | null;
  deadline?: string;
  applyUrl?: string;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createOpportunity(
  payload: OpportunityPayload
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth();

    const { error } = await supabase.from("opportunities").insert({
      slug:         payload.slug,
      title:        payload.title,
      tagline:      payload.tagline,
      description:  payload.description,
      category:     payload.category,
      status:       payload.status,
      provider:     payload.provider,
      location:     payload.location,
      audience:     payload.audience,
      eligibility:  payload.eligibility,
      how_to_apply: payload.howToApply,
      featured:     payload.featured,
      cover_image:  payload.coverImageUrl,
      ...(payload.deadline && { deadline:   payload.deadline }),
      ...(payload.applyUrl && { apply_url:  payload.applyUrl }),
    });

    if (error) {
      return {
        success: false,
        error:
          error.code === "23505"
            ? "An opportunity with this slug already exists. Change the title or edit the slug manually."
            : error.message,
      };
    }

    revalidateOpportunityPaths(payload.slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateOpportunity(
  originalSlug: string,
  payload: OpportunityPayload
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth();

    const { error } = await supabase
      .from("opportunities")
      .update({
        title:        payload.title,
        tagline:      payload.tagline,
        description:  payload.description,
        category:     payload.category,
        status:       payload.status,
        provider:     payload.provider,
        location:     payload.location,
        audience:     payload.audience,
        eligibility:  payload.eligibility,
        how_to_apply: payload.howToApply,
        featured:     payload.featured,
        cover_image:  payload.coverImageUrl,
        deadline:     payload.deadline  ?? null,
        apply_url:    payload.applyUrl  ?? null,
      })
      .eq("slug", originalSlug);

    if (error) return { success: false, error: error.message };

    revalidateOpportunityPaths(originalSlug);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Toggle status ────────────────────────────────────────────────────────────

export async function toggleOpportunityStatus(
  slug: string,
  currentStatus: Opportunity["status"]
): Promise<ActionResult & { newStatus?: Opportunity["status"] }> {
  try {
    const { supabase } = await requireAuth();

    const newStatus: Opportunity["status"] =
      currentStatus === "open" ? "closed" : "open";

    const { error } = await supabase
      .from("opportunities")
      .update({ status: newStatus })
      .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidateOpportunityPaths(slug);
    return { success: true, newStatus };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOpportunity(slug: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAuth();

    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidateOpportunityPaths(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
