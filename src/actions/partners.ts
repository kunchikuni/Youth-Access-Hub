"use server";

/**
 * Partner Server Actions
 *
 * All database writes for partners go through here - never from
 * the browser directly. Each action:
 *  1. Verifies the user is authenticated
 *  2. Performs the Supabase mutation using the server client
 *  3. Calls revalidatePath() so affected public pages regenerate immediately
 *  4. Logs the action to audit_log
 *  5. Returns a typed result object - never throws - so the client
 *     can handle success and error states cleanly
 *
 * Partners have no open/closed status (unlike programs/opportunities),
 * so there is no toggleStatus action here - only create, update,
 * delete, and a dedicated toggleFeatured for the one boolean flag
 * that's commonly flipped from the list view.
 *
 * @module actions/partners
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEntry } from "@/lib/auditLog";
import type { Partner } from "@/types/partner";

// --- Result type --------------------------------------------------------------

export interface ActionResult {
  success: boolean;
  error?: string;
}

// --- Paths to revalidate after any partner mutation ---------------------------

function revalidatePartnerPaths() {
  revalidatePath("/");
  revalidatePath("/partners");
}

// --- Auth guard ---------------------------------------------------------------

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorised");
  return { supabase, user };
}

// --- Payload shape shared by create and update --------------------------------

export interface PartnerPayload {
  slug: string;
  name: string;
  description: string;
  type: Partner["type"];
  contribution: string;
  featured: boolean;
  logoUrl: string | null;
  website?: string;
}

// --- Create -------------------------------------------------------------------

export async function createPartner(
  payload: PartnerPayload
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase.from("partners").insert({
      slug:         payload.slug,
      name:         payload.name,
      description:  payload.description,
      type:         payload.type,
      contribution: payload.contribution,
      featured:     payload.featured,
      logo:         payload.logoUrl,
      ...(payload.website && { website: payload.website }),
    });

    if (error) {
      return {
        success: false,
        error:
          error.code === "23505"
            ? "A partner with this slug already exists. Change the name or edit the slug manually."
            : error.message,
      };
    }

    revalidatePartnerPaths();

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "partner",
      entitySlug: payload.slug,
      entityTitle: payload.name,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- Update -------------------------------------------------------------------

export async function updatePartner(
  originalSlug: string,
  payload: PartnerPayload
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase
      .from("partners")
      .update({
        name:         payload.name,
        description:  payload.description,
        type:         payload.type,
        contribution: payload.contribution,
        featured:     payload.featured,
        logo:         payload.logoUrl,
        website:      payload.website ?? null,
      })
      .eq("slug", originalSlug);

    if (error) return { success: false, error: error.message };

    revalidatePartnerPaths();

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "partner",
      entitySlug: originalSlug,
      entityTitle: payload.name,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- Toggle featured ----------------------------------------------------------

export async function togglePartnerFeatured(
  slug: string,
  currentFeatured: boolean
): Promise<ActionResult & { newFeatured?: boolean }> {
  try {
    const { supabase, user } = await requireAuth();

    const newFeatured = !currentFeatured;

    const { error } = await supabase
      .from("partners")
      .update({ featured: newFeatured })
      .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidatePartnerPaths();

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "status_toggle",
      entityType: "partner",
      entitySlug: slug,
      changes: { from: currentFeatured, to: newFeatured, field: "featured" },
    });

    return { success: true, newFeatured };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- Delete -------------------------------------------------------------------

export async function deletePartner(slug: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    // Fetch name before deleting, so the audit log has a readable
    // record even after the row itself is gone.
    const { data: existing } = await supabase
      .from("partners")
      .select("name")
      .eq("slug", slug)
      .single();

    const { error } = await supabase
      .from("partners")
      .delete()
      .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidatePartnerPaths();

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      entityType: "partner",
      entitySlug: slug,
      entityTitle: existing?.name,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
