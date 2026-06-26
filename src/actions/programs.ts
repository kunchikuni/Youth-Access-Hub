"use server";

/**
 * Program Server Actions
 *
 * All database writes for programs go through here — never from
 * the browser directly. Each action:
 *  1. Verifies the user is authenticated
 *  2. Performs the Supabase mutation using the server client
 *  3. Calls revalidatePath() so affected public pages regenerate immediately
 *  4. Returns a typed result object — never throws — so the client
 *     can handle success and error states cleanly
 *
 * @module actions/programs
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEntry } from "@/lib/auditLog";
import type { Program, Mentor } from "@/types/program";

// ─── Result type ──────────────────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─── Paths to revalidate after any program mutation ───────────────────────────

function revalidateProgramPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/programs");
  if (slug) revalidatePath(`/programs/${slug}`);
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorised");
  return { supabase, user };
}

// ─── Payload shape shared by create and update ────────────────────────────────

export interface ProgramPayload {
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
  coverImageUrl: string | null;
  startDate?: string;
  partner?: string;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProgram(
    payload: ProgramPayload
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase.from("programs").insert({
      slug:        payload.slug,
      title:       payload.title,
      tagline:     payload.tagline,
      description: payload.description,
      category:    payload.category,
      status:      payload.status,
      duration:    payload.duration,
      audience:    payload.audience,
      outcomes:    payload.outcomes,
      mentors:     payload.mentors,
      featured:    payload.featured,
      cover_image: payload.coverImageUrl,
      ...(payload.startDate && { start_date: payload.startDate }),
      ...(payload.partner   && { partner:    payload.partner }),
    });

    if (error) {
      return {
        success: false,
        error:
            error.code === "23505"
                ? "A program with this slug already exists. Change the title or edit the slug manually."
                : error.message,
      };
    }

    revalidateProgramPaths(payload.slug);

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "program",
      entitySlug: payload.slug,
      entityTitle: payload.title,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProgram(
    originalSlug: string,
    payload: ProgramPayload
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase
        .from("programs")
        .update({
          title:       payload.title,
          tagline:     payload.tagline,
          description: payload.description,
          category:    payload.category,
          status:      payload.status,
          duration:    payload.duration,
          audience:    payload.audience,
          outcomes:    payload.outcomes,
          mentors:     payload.mentors,
          featured:    payload.featured,
          cover_image: payload.coverImageUrl,
          start_date:  payload.startDate ?? null,
          partner:     payload.partner   ?? null,
        })
        .eq("slug", originalSlug);

    if (error) return { success: false, error: error.message };

    revalidateProgramPaths(originalSlug);

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "program",
      entitySlug: originalSlug,
      entityTitle: payload.title,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Toggle status ────────────────────────────────────────────────────────────

export async function toggleProgramStatus(
    slug: string,
    currentStatus: Program["status"]
): Promise<ActionResult & { newStatus?: Program["status"] }> {
  try {
    const { supabase, user } = await requireAuth();

    const newStatus: Program["status"] =
        currentStatus === "open" ? "closed" : "open";

    const { error } = await supabase
        .from("programs")
        .update({ status: newStatus })
        .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidateProgramPaths(slug);

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "status_toggle",
      entityType: "program",
      entitySlug: slug,
      changes: { from: currentStatus, to: newStatus },
    });

    return { success: true, newStatus };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProgram(slug: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    // Fetch title before deleting, so the audit log has a readable
    // record even after the row itself is gone.
    const { data: existing } = await supabase
        .from("programs")
        .select("title")
        .eq("slug", slug)
        .single();

    const { error } = await supabase
        .from("programs")
        .delete()
        .eq("slug", slug);

    if (error) return { success: false, error: error.message };

    revalidateProgramPaths(slug);

    await logAuditEntry({
      supabase,
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      entityType: "program",
      entitySlug: slug,
      entityTitle: existing?.title,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}