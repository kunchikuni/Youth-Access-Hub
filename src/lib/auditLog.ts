/**
 * Audit Logging Helper
 *
 * Records executive actions (create/update/delete/status toggle)
 * to the audit_log table. Called from server actions only, after
 * a mutation has already succeeded — logging failures never block
 * or roll back the underlying mutation.
 *
 * @module lib/auditLog
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction = "create" | "update" | "delete" | "status_toggle";
export type AuditEntity = "program" | "opportunity";

interface LogAuditEntryParams {
  supabase: SupabaseClient;
  userId: string;
  userEmail: string | undefined;
  action: AuditAction;
  entityType: AuditEntity;
  entitySlug: string;
  entityTitle?: string;
  changes?: Record<string, unknown>;
}

/**
 * Writes one row to audit_log. Never throws — if logging fails,
 * it's recorded to console but does not affect the caller's flow.
 * The underlying mutation has already committed by the time this
 * is called, so a logging failure should never undo real work.
 */
export async function logAuditEntry({
  supabase,
  userId,
  userEmail,
  action,
  entityType,
  entitySlug,
  entityTitle,
  changes,
}: LogAuditEntryParams): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      user_email: userEmail ?? null,
      action,
      entity_type: entityType,
      entity_slug: entitySlug,
      entity_title: entityTitle ?? null,
      changes: changes ?? null,
    });

    if (error) {
      console.error("[auditLog] Failed to write audit entry:", error.message);
    }
  } catch (err) {
    console.error("[auditLog] Unexpected error writing audit entry:", err);
  }
}
