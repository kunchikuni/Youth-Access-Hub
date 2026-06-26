# ============================================================
# Add Partners Admin script (Windows PowerShell 5.1 safe)
#
# Writes 8 files implementing full admin CRUD for Partners,
# mirroring the existing Programs/Opportunities admin pattern:
#   - src/actions/partners.ts            (server actions)
#   - src/components/admin/PartnersTable.tsx
#   - src/components/admin/PartnerForm.tsx
#   - src/app/admin/(dashboard)/partners/page.tsx
#   - src/app/admin/(dashboard)/partners/new/page.tsx
#   - src/app/admin/(dashboard)/partners/[slug]/page.tsx
#   - src/app/admin/(dashboard)/partners/loading.tsx
#   - src/components/admin/AdminShell.tsx (adds Partners nav link)
#
# IMPORTANT: before running this, you must first run
# add-partner-enum.sql in the Supabase SQL Editor to add 'partner'
# to the audit_entity enum, or audit logging will fail the first
# time a partner is created/edited/deleted.
#
# Uses [System.IO.File]::WriteAllText() with explicit UTF8 (no BOM)
# encoding - safe for PowerShell 5.1's multi-byte character bug.
#
# Run this from your project ROOT (where package.json lives):
#   .\add-partners-admin.ps1
# ============================================================

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$actionsContent = @'
"use server";

/**
 * Partner Server Actions
 *
 * All database writes for partners go through here — never from
 * the browser directly. Each action:
 *  1. Verifies the user is authenticated
 *  2. Performs the Supabase mutation using the server client
 *  3. Calls revalidatePath() so affected public pages regenerate immediately
 *  4. Logs the action to audit_log
 *  5. Returns a typed result object — never throws — so the client
 *     can handle success and error states cleanly
 *
 * Partners have no open/closed status (unlike programs/opportunities),
 * so there is no toggleStatus action here — only create, update,
 * delete, and a dedicated toggleFeatured for the one boolean flag
 * that's commonly flipped from the list view.
 *
 * @module actions/partners
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEntry } from "@/lib/auditLog";
import type { Partner } from "@/types/partner";

// ─── Result type ──────────────────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─── Paths to revalidate after any partner mutation ───────────────────────────

function revalidatePartnerPaths() {
  revalidatePath("/");
  revalidatePath("/partners");
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorised");
  return { supabase, user };
}

// ─── Payload shape shared by create and update ────────────────────────────────

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

// ─── Create ───────────────────────────────────────────────────────────────────

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

// ─── Update ───────────────────────────────────────────────────────────────────

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

// ─── Toggle featured ──────────────────────────────────────────────────────────

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

// ─── Delete ───────────────────────────────────────────────────────────────────

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

'@

$tableContent = @'
"use client";

/**
 * PartnersTable
 *
 * Interactive table for the /admin/partners page.
 * Unlike ProgramsTable/OpportunitiesTable, there is no open/closed
 * status — only a featured toggle and delete (with confirmation).
 * All mutations call server actions in src/actions/partners.ts.
 *
 * @module components/admin/PartnersTable
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePartnerFeatured, deletePartner } from "@/actions/partners";
import type { Partner } from "@/types/partner";

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: Partner["type"] }) {
  const map: Record<Partner["type"], { color: string; bg: string }> = {
    school:       { color: "var(--yah-orange)", bg: "rgba(245,166,35,0.1)" },
    university:   { color: "var(--yah-sky)",    bg: "rgba(74,159,212,0.1)" },
    ngo:          { color: "var(--yah-teal)",   bg: "rgba(43,174,142,0.1)" },
    corporate:    { color: "var(--yah-navy)",   bg: "rgba(27,47,107,0.08)" },
    government:   { color: "#d97706",           bg: "rgba(217,119,6,0.1)" },
    community:    { color: "var(--yah-teal)",   bg: "rgba(43,174,142,0.1)" },
  };
  const s = map[type];
  return (
    <span className="tbl-badge" style={{ color: s.color, background: s.bg }}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PartnersTableProps {
  partners: Partner[];
}

export default function PartnersTable({ partners: initial }: PartnersTableProps) {
  const router = useRouter();
  const [partners, setPartners] = useState(initial);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleFeatured(partner: Partner) {
    setLoadingSlug(partner.slug);
    setError(null);

    const result = await togglePartnerFeatured(partner.slug, partner.featured);

    if (!result.success || result.newFeatured === undefined) {
      setError(result.error ?? "Failed to update featured status.");
    } else {
      setPartners((prev) =>
        prev.map((p) =>
          p.slug === partner.slug ? { ...p, featured: result.newFeatured! } : p
        )
      );
    }
    setLoadingSlug(null);
  }

  async function handleDelete(slug: string) {
    setLoadingSlug(slug);
    setError(null);

    const result = await deletePartner(slug);

    if (!result.success) {
      setError(result.error ?? "Failed to delete partner.");
      setLoadingSlug(null);
    } else {
      setPartners((prev) => prev.filter((p) => p.slug !== slug));
      setDeleteSlug(null);
      setLoadingSlug(null);
      router.refresh();
    }
  }

  return (
    <div className="tbl-wrap">
      {error && <div className="tbl-error" role="alert">{error}</div>}

      {deleteSlug && (
        <div className="tbl-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="tbl-modal">
            <h3 className="tbl-modal-title">Delete partner?</h3>
            <p className="tbl-modal-body">
              This will permanently delete{" "}
              <strong>{partners.find((p) => p.slug === deleteSlug)?.name}</strong>.
              This action cannot be undone.
            </p>
            <div className="tbl-modal-actions">
              <button className="tbl-btn tbl-btn--ghost" onClick={() => setDeleteSlug(null)} disabled={loadingSlug === deleteSlug}>
                Cancel
              </button>
              <button className="tbl-btn tbl-btn--danger" onClick={() => handleDelete(deleteSlug)} disabled={loadingSlug === deleteSlug}>
                {loadingSlug === deleteSlug ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th className="tbl-th">Name</th>
              <th className="tbl-th">Type</th>
              <th className="tbl-th">Website</th>
              <th className="tbl-th">Featured</th>
              <th className="tbl-th tbl-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.slug} className="tbl-row">
                <td className="tbl-td">
                  <span className="tbl-title">{partner.name}</span>
                  <span className="tbl-slug">{partner.slug}</span>
                </td>

                <td className="tbl-td">
                  <TypeBadge type={partner.type} />
                </td>

                <td className="tbl-td">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tbl-link"
                    >
                      {partner.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="tbl-muted">—</span>
                  )}
                </td>

                <td className="tbl-td">
                  {partner.featured ? (
                    <span className="tbl-badge" style={{ color: "var(--yah-sky)", background: "rgba(74,159,212,0.1)" }}>
                      Featured
                    </span>
                  ) : (
                    <span className="tbl-muted">—</span>
                  )}
                </td>

                <td className="tbl-td tbl-td--actions">
                  <Link
                    href={`/admin/partners/${partner.slug}`}
                    className="tbl-btn tbl-btn--ghost"
                    aria-label={`Edit ${partner.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </Link>

                  <button
                    className={`tbl-btn ${partner.featured ? "tbl-btn--warning" : "tbl-btn--success"}`}
                    onClick={() => handleToggleFeatured(partner)}
                    disabled={loadingSlug === partner.slug}
                    aria-label={partner.featured ? `Unfeature ${partner.name}` : `Feature ${partner.name}`}
                  >
                    {loadingSlug === partner.slug ? "…" : partner.featured ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.75" />
                        </svg>
                        Unfeature
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.15" />
                        </svg>
                        Feature
                      </>
                    )}
                  </button>

                  <button
                    className="tbl-btn tbl-btn--danger-ghost"
                    onClick={() => setDeleteSlug(partner.slug)}
                    disabled={loadingSlug === partner.slug}
                    aria-label={`Delete ${partner.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .tbl-wrap { display:flex; flex-direction:column; gap:1rem; }
        .tbl-error { padding:0.75rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; }
        .tbl-scroll { overflow-x:auto; border-radius:var(--radius-lg); border:1.5px solid var(--yah-light-gray); background:var(--yah-white); }
        .tbl { width:100%; border-collapse:collapse; font-size:0.875rem; min-width:680px; }
        .tbl-th { padding:0.75rem 1rem; text-align:left; font-family:var(--font-heading); font-size:0.75rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--yah-slate); background:var(--yah-off-white); border-bottom:1.5px solid var(--yah-light-gray); white-space:nowrap; }
        .tbl-th--actions { text-align:right; }
        .tbl-row { border-bottom:1px solid var(--yah-light-gray); transition:background 150ms ease; }
        .tbl-row:last-child { border-bottom:none; }
        .tbl-row:hover { background:var(--yah-off-white); }
        .tbl-td { padding:0.875rem 1rem; vertical-align:middle; }
        .tbl-td--actions { text-align:right; white-space:nowrap; }
        .tbl-title { display:block; font-family:var(--font-heading); font-weight:600; color:var(--yah-navy); font-size:0.875rem; }
        .tbl-slug { display:block; font-size:0.75rem; color:var(--yah-slate); margin-top:0.125rem; opacity:0.7; }
        .tbl-link { font-size:0.8125rem; color:var(--yah-sky); text-decoration:underline; text-underline-offset:2px; }
        .tbl-link:hover { color:var(--yah-navy); }
        .tbl-badge { display:inline-flex; align-items:center; padding:0.2rem 0.625rem; border-radius:999px; font-size:0.75rem; font-weight:600; font-family:var(--font-heading); white-space:nowrap; }
        .tbl-muted { color:var(--yah-light-gray); font-size:0.875rem; }
        .tbl-btn { display:inline-flex; align-items:center; gap:0.3rem; padding:0.375rem 0.625rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:600; font-family:var(--font-heading); cursor:pointer; border:1px solid transparent; transition:background 150ms ease, color 150ms ease, border-color 150ms ease; text-decoration:none; white-space:nowrap; }
        .tbl-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .tbl-btn--ghost { background:transparent; color:var(--yah-navy); border-color:var(--yah-light-gray); }
        .tbl-btn--ghost:hover:not(:disabled) { background:var(--yah-off-white); border-color:var(--yah-navy); }
        .tbl-btn--success { background:rgba(74,159,212,0.08); color:var(--yah-sky); border-color:rgba(74,159,212,0.2); }
        .tbl-btn--success:hover:not(:disabled) { background:rgba(74,159,212,0.15); }
        .tbl-btn--warning { background:rgba(217,119,6,0.08); color:#d97706; border-color:rgba(217,119,6,0.2); }
        .tbl-btn--warning:hover:not(:disabled) { background:rgba(217,119,6,0.15); }
        .tbl-btn--danger-ghost { background:transparent; color:#dc2626; border-color:transparent; }
        .tbl-btn--danger-ghost:hover:not(:disabled) { background:rgba(220,38,38,0.06); border-color:rgba(220,38,38,0.2); }
        .tbl-btn--danger { background:#dc2626; color:white; border-color:#dc2626; }
        .tbl-btn--danger:hover:not(:disabled) { background:#b91c1c; }
        .tbl-td--actions .tbl-btn + .tbl-btn { margin-left:0.375rem; }
        .tbl-modal-overlay { position:fixed; inset:0; background:rgba(15,30,74,0.5); backdrop-filter:blur(3px); z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .tbl-modal { background:var(--yah-white); border-radius:var(--radius-xl); padding:2rem; max-width:420px; width:100%; box-shadow:0 20px 60px rgba(15,30,74,0.2); }
        .tbl-modal-title { font-family:var(--font-heading); font-size:1.125rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.75rem; }
        .tbl-modal-body { font-size:0.9375rem; color:var(--yah-slate); margin:0 0 1.5rem; line-height:1.6; }
        .tbl-modal-actions { display:flex; justify-content:flex-end; gap:0.75rem; }
        .tbl-modal-actions .tbl-btn { padding:0.625rem 1.125rem; font-size:0.875rem; }
      `}</style>
    </div>
  );
}

'@

$formContent = @'
"use client";

/**
 * PartnerForm
 *
 * Shared form used by both:
 *  - /admin/partners/new    (create mode)
 *  - /admin/partners/[slug] (edit mode — prefilled)
 *
 * Simpler than ProgramForm/OpportunityForm — no nested arrays
 * (no mentors, outcomes, or eligibility lists), just flat fields
 * plus one logo image upload.
 *
 * Image upload uses the same client-upload, server-write split
 * (Option A) as programs/opportunities: browser uploads directly
 * to Supabase Storage, then passes the public URL to the server
 * action, which only ever touches the database.
 *
 * @module components/admin/PartnerForm
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPartner, updatePartner } from "@/actions/partners";
import type { Partner, PartnerType } from "@/types/partner";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const PARTNER_TYPES: { value: PartnerType; label: string }[] = [
  { value: "school",     label: "School" },
  { value: "university", label: "University" },
  { value: "ngo",         label: "NGO" },
  { value: "corporate",   label: "Corporate" },
  { value: "government",  label: "Government" },
  { value: "community",   label: "Community" },
];

function FieldLabel({ htmlFor, children, required }: {
  htmlFor: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="pnf-label">
      {children}
      {required && <span className="pnf-required" aria-hidden="true"> *</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="pnf-field-error" role="alert">{message}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pnf-section-heading">{children}</h3>;
}

interface PartnerFormProps {
  partner?: Partner;
}

type FormErrors = Partial<Record<string, string>>;

export default function PartnerForm({ partner }: PartnerFormProps) {
  const router = useRouter();
  const isEdit = !!partner;

  const [name,         setName]         = useState(partner?.name         ?? "");
  const [slug,         setSlug]         = useState(partner?.slug         ?? "");
  const [description,  setDescription]  = useState(partner?.description  ?? "");
  const [type,         setType]         = useState<PartnerType>(partner?.type ?? "ngo");
  const [contribution, setContribution] = useState(partner?.contribution ?? "");
  const [website,      setWebsite]      = useState(partner?.website      ?? "");
  const [featured,     setFeatured]     = useState(partner?.featured     ?? false);

  const [imageFile,      setImageFile]      = useState<File | null>(null);
  const [imagePreview,   setImagePreview]   = useState<string | null>(partner?.logo ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors,      setErrors]      = useState<FormErrors>({});
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(slugify(value));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  const uploadImage = useCallback(async (file: File, slug: string): Promise<string | null> => {
    setUploadingImage(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `partners/${slug}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("yah-media")
      .upload(path, file, { upsert: true });

    setUploadingImage(false);

    if (error) {
      setGlobalError(`Logo upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("yah-media").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim())         e.name         = "Name is required.";
    if (!slug.trim())         e.slug         = "Slug is required.";
    if (!description.trim()) e.description  = "Description is required.";
    if (!contribution.trim()) e.contribution = "Contribution is required.";

    if (website && !/^https?:\/\/.+/.test(website))
      e.website = "Website URL must start with http:// or https://";

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      document
        .querySelector("[data-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setSaving(true);

    let logoUrl: string | null = imagePreview ?? null;
    if (imageFile) {
      logoUrl = await uploadImage(imageFile, slug);
      if (!logoUrl) {
        setSaving(false);
        return;
      }
    }

    const payload = {
      slug:         slug.trim(),
      name:         name.trim(),
      description:  description.trim(),
      type,
      contribution: contribution.trim(),
      featured,
      logoUrl,
      ...(website.trim() && { website: website.trim() }),
    };

    const result = isEdit
      ? await updatePartner(partner!.slug, payload)
      : await createPartner(payload);

    if (!result.success) {
      setGlobalError(result.error ?? "Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/admin/partners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="pnf-form" noValidate>

      {globalError && (
        <div className="pnf-global-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {globalError}
        </div>
      )}

      <div className="pnf-card">
        <SectionHeading>Core details</SectionHeading>

        <div className="pnf-field" data-error={errors.name || undefined}>
          <FieldLabel htmlFor="name" required>Organisation name</FieldLabel>
          <input id="name" type="text" value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`pnf-input ${errors.name ? "pnf-input--error" : ""}`}
            placeholder="e.g. Econet Wireless" />
          <FieldError message={errors.name} />
        </div>

        <div className="pnf-field" data-error={errors.slug || undefined}>
          <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
          <input id="slug" type="text" value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`pnf-input pnf-input--mono ${errors.slug ? "pnf-input--error" : ""}`}
            placeholder="econet-wireless"
            readOnly={isEdit}
            aria-describedby="slug-hint" />
          <span id="slug-hint" className="pnf-hint">
            {isEdit
              ? "Slug cannot be changed after creation."
              : "Auto-generated from the organisation name."}
          </span>
          <FieldError message={errors.slug} />
        </div>

        <div className="pnf-field" data-error={errors.description || undefined}>
          <FieldLabel htmlFor="description" required>Description</FieldLabel>
          <textarea id="description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`pnf-textarea ${errors.description ? "pnf-input--error" : ""}`}
            placeholder="One-line description of what they provide…" rows={3} />
          <FieldError message={errors.description} />
        </div>

        <div className="pnf-row">
          <div className="pnf-field">
            <FieldLabel htmlFor="type" required>Type</FieldLabel>
            <select id="type" value={type}
              onChange={(e) => setType(e.target.value as PartnerType)}
              className="pnf-select">
              {PARTNER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="pnf-field" data-error={errors.website || undefined}>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <input id="website" type="url" value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={`pnf-input ${errors.website ? "pnf-input--error" : ""}`}
              placeholder="https://…" />
            <FieldError message={errors.website} />
          </div>
        </div>

        <div className="pnf-field" data-error={errors.contribution || undefined}>
          <FieldLabel htmlFor="contribution" required>Contribution</FieldLabel>
          <textarea id="contribution" value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className={`pnf-textarea ${errors.contribution ? "pnf-input--error" : ""}`}
            placeholder="What this partner specifically provides to YAH's network…" rows={3} />
          <FieldError message={errors.contribution} />
        </div>

        <div className="pnf-field">
          <label className="pnf-toggle-label">
            <input type="checkbox" checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="pnf-toggle-input" />
            <span className="pnf-toggle-track" aria-hidden="true" />
            <span className="pnf-toggle-text">
              Feature on Partners page
              <span className="pnf-hint pnf-hint--inline">
                Featured partners are shown prominently on the public Partners page.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="pnf-card">
        <SectionHeading>Logo</SectionHeading>
        <p className="pnf-section-desc">
          Uploaded to Supabase Storage. Recommended: square, transparent background, PNG.
        </p>

        {imagePreview ? (
          <div className="pnf-image-preview-wrap">
            <img src={imagePreview} alt="Logo preview" className="pnf-image-preview" />
            <button type="button" onClick={clearImage} className="pnf-image-clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Remove logo
            </button>
          </div>
        ) : (
          <label className="pnf-image-drop" htmlFor="logo-image">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="pnf-image-drop-label">Click to upload a logo</span>
            <span className="pnf-hint">JPG, PNG or WebP — max 5 MB</span>
            <input id="logo-image" type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="pnf-sr-only" />
          </label>
        )}
      </div>

      <div className="pnf-actions">
        <button type="button" onClick={() => router.push("/admin/partners")}
          className="pnf-cancel-btn" disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="pnf-submit-btn"
          disabled={saving || uploadingImage}>
          {saving || uploadingImage ? (
            <>
              <span className="pnf-spinner" aria-hidden="true" />
              {uploadingImage ? "Uploading logo…" : "Saving…"}
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isEdit ? "Save changes" : "Create partner"}
            </>
          )}
        </button>
      </div>

      <style>{`
        .pnf-form { display:flex; flex-direction:column; gap:1.25rem; max-width:780px; }
        .pnf-card { background:var(--yah-white); border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-lg); padding:1.75rem; display:flex; flex-direction:column; gap:1.125rem; }
        .pnf-section-heading { font-family:var(--font-heading); font-size:1rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; padding-bottom:0.75rem; border-bottom:1px solid var(--yah-light-gray); }
        .pnf-section-desc { font-size:0.875rem; color:var(--yah-slate); margin:-0.5rem 0 0; }
        .pnf-field { display:flex; flex-direction:column; gap:0.375rem; flex:1; }
        .pnf-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .pnf-label { font-family:var(--font-heading); font-size:0.8125rem; font-weight:600; color:var(--yah-navy); letter-spacing:0.01em; }
        .pnf-required { color:#dc2626; }
        .pnf-input,.pnf-textarea,.pnf-select { padding:0.6875rem 0.875rem; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.9375rem; font-family:var(--font-body); color:var(--yah-navy); background:var(--yah-white); transition:border-color 150ms ease,box-shadow 150ms ease; outline:none; width:100%; }
        .pnf-input::placeholder,.pnf-textarea::placeholder { color:var(--yah-slate); opacity:0.4; }
        .pnf-input:focus,.pnf-textarea:focus,.pnf-select:focus { border-color:var(--yah-navy); box-shadow:0 0 0 3px rgba(27,47,107,0.08); }
        .pnf-input--error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
        .pnf-input--mono { font-family:ui-monospace,monospace; font-size:0.875rem; }
        .pnf-textarea { resize:vertical; min-height:80px; }
        .pnf-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.875rem center; padding-right:2.5rem; cursor:pointer; }
        .pnf-hint { font-size:0.75rem; color:var(--yah-slate); opacity:0.7; }
        .pnf-hint--inline { font-weight:400; font-family:var(--font-body); }
        .pnf-field-error { font-size:0.8125rem; color:#dc2626; font-weight:500; }
        .pnf-global-error { display:flex; align-items:center; gap:0.625rem; padding:0.875rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; font-weight:500; }
        .pnf-toggle-label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; user-select:none; }
        .pnf-toggle-input { position:absolute; opacity:0; width:0; height:0; }
        .pnf-toggle-track { position:relative; display:inline-block; width:40px; height:22px; background:var(--yah-light-gray); border-radius:999px; flex-shrink:0; transition:background 200ms ease; }
        .pnf-toggle-track::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform 200ms ease; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        .pnf-toggle-input:checked + .pnf-toggle-track { background:var(--yah-teal); }
        .pnf-toggle-input:checked + .pnf-toggle-track::after { transform:translateX(18px); }
        .pnf-toggle-text { display:flex; flex-direction:column; gap:0.125rem; font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .pnf-image-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.625rem; padding:2.5rem 1.5rem; border:2px dashed var(--yah-light-gray); border-radius:var(--radius-lg); cursor:pointer; text-align:center; transition:border-color 150ms ease,background 150ms ease; }
        .pnf-image-drop:hover { border-color:var(--yah-teal); background:rgba(43,174,142,0.03); }
        .pnf-image-drop-label { font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .pnf-image-preview-wrap { display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start; }
        .pnf-image-preview { width:140px; height:140px; object-fit:contain; border-radius:var(--radius-md); border:1.5px solid var(--yah-light-gray); background:var(--yah-off-white); padding:0.75rem; }
        .pnf-image-clear { display:inline-flex; align-items:center; gap:0.375rem; font-size:0.8125rem; font-weight:600; color:#dc2626; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-sm); padding:0.375rem 0.75rem; cursor:pointer; transition:background 150ms ease; font-family:var(--font-heading); }
        .pnf-image-clear:hover { background:rgba(220,38,38,0.12); }
        .pnf-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .pnf-actions { display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; padding:1rem 0 0.5rem; }
        .pnf-cancel-btn { padding:0.6875rem 1.25rem; background:transparent; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease,color 150ms ease; font-family:var(--font-heading); }
        .pnf-cancel-btn:hover:not(:disabled) { border-color:var(--yah-navy); color:var(--yah-navy); }
        .pnf-cancel-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pnf-submit-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6875rem 1.5rem; background:var(--yah-navy); color:var(--yah-white); border:none; border-radius:var(--radius-md); font-size:0.875rem; font-weight:700; cursor:pointer; transition:background 150ms ease,transform 150ms ease; font-family:var(--font-heading); }
        .pnf-submit-btn:hover:not(:disabled) { background:var(--yah-dark); transform:translateY(-1px); }
        .pnf-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .pnf-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:pnf-spin 0.7s linear infinite; }
        @keyframes pnf-spin { to { transform:rotate(360deg); } }
        @media (max-width:600px) {
          .pnf-row { grid-template-columns:1fr; }
          .pnf-card { padding:1.25rem; }
          .pnf-actions { flex-direction:column-reverse; }
          .pnf-cancel-btn,.pnf-submit-btn { width:100%; justify-content:center; }
        }
      `}</style>
    </form>
  );
}

'@

$list_pageContent = @'
/**
 * Admin Partners List
 * Route: /admin/partners
 *
 * Server Component — fetches all partners from Supabase.
 *
 * @module app/admin/(dashboard)/partners/page
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PartnersTable from "@/components/admin/PartnersTable";
import type { Partner } from "@/types/partner";

export const metadata = { title: "Partners — YAH Admin" };

export default async function AdminPartnersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  const partners = (data ?? []) as Partner[];

  return (
    <div className="pnl-root">

      <div className="pnl-header">
        <div>
          <h2 className="pnl-title">Partners</h2>
          <p className="pnl-sub">
            {partners.length} partner{partners.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/partners/new" className="pnl-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New partner
        </Link>
      </div>

      {error && (
        <div className="pnl-error" role="alert">
          Failed to load partners: {error.message}
        </div>
      )}

      {!error && partners.length === 0 && (
        <div className="pnl-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
          </svg>
          <p>No partners yet.</p>
          <Link href="/admin/partners/new" className="pnl-add-btn">
            Add the first partner
          </Link>
        </div>
      )}

      {!error && partners.length > 0 && (
        <PartnersTable partners={partners} />
      )}

      <style>{`
        .pnl-root { display:flex; flex-direction:column; gap:1.5rem; max-width:960px; }
        .pnl-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
        .pnl-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; }
        .pnl-sub { font-size:0.875rem; color:var(--yah-slate); margin:0; }
        .pnl-add-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.125rem; background:var(--yah-navy); color:var(--yah-white); border-radius:var(--radius-md); font-family:var(--font-heading); font-size:0.875rem; font-weight:600; text-decoration:none; transition:background 150ms ease, transform 150ms ease; white-space:nowrap; }
        .pnl-add-btn:hover { background:var(--yah-dark); transform:translateY(-1px); }
        .pnl-error { padding:1rem 1.25rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; }
        .pnl-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:4rem 2rem; background:var(--yah-white); border:1.5px dashed var(--yah-light-gray); border-radius:var(--radius-lg); text-align:center; }
        .pnl-empty p { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
      `}</style>
    </div>
  );
}

'@

$new_pageContent = @'
/**
 * New Partner Page
 * Route: /admin/partners/new
 *
 * Server Component — renders PartnerForm in create mode.
 *
 * @module app/admin/(dashboard)/partners/new/page
 */

import PartnerForm from "@/components/admin/PartnerForm";

export const metadata = { title: "New Partner — YAH Admin" };

export default function NewPartnerPage() {
  return (
    <div className="pnn-root">
      <div className="pnn-header">
        <h2 className="pnn-title">New partner</h2>
        <p className="pnn-sub">
          Add a new partner organisation to the network.
        </p>
      </div>

      <PartnerForm />

      <style>{`
        .pnn-root { display:flex; flex-direction:column; gap:1.5rem; }
        .pnn-header { max-width:780px; }
        .pnn-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .pnn-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
      `}</style>
    </div>
  );
}

'@

$edit_pageContent = @'
/**
 * Edit Partner Page
 * Route: /admin/partners/[slug]
 *
 * Server Component — fetches the existing partner from Supabase
 * and renders PartnerForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" — that route is handled by
 * /admin/partners/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/partners/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PartnerForm from "@/components/admin/PartnerForm";
import type { Partner } from "@/types/partner";

export const metadata = { title: "Edit Partner — YAH Admin" };

interface EditPartnerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { slug } = await params;

  if (slug === "new") {
    redirect("/admin/partners/new");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  // Map DB row (snake_case) -> Partner type (camelCase) for the form
  const partner: Partner = {
    slug:         data.slug,
    name:         data.name,
    description:  data.description,
    type:         data.type,
    contribution: data.contribution,
    featured:     data.featured,
    ...(data.logo    && { logo:    data.logo }),
    ...(data.website && { website: data.website }),
  };

  return (
    <div className="pne-root">
      <div className="pne-header">
        <h2 className="pne-title">Edit partner</h2>
        <p className="pne-sub">
          Editing: <strong>{partner.name}</strong>
        </p>
      </div>

      <PartnerForm partner={partner} />

      <style>{`
        .pne-root { display:flex; flex-direction:column; gap:1.5rem; }
        .pne-header { max-width:780px; }
        .pne-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .pne-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
        .pne-sub strong { color:var(--yah-navy); font-weight:600; }
      `}</style>
    </div>
  );
}

'@

$loading_pageContent = @'
/**
 * Partners List Loading Skeleton
 * Shown automatically by Next.js while the partners table page
 * fetches data from Supabase.
 *
 * @module app/admin/(dashboard)/partners/loading
 */

export default function PartnersLoading() {
  return (
    <div className="skel-list-root">

      <div className="skel-list-header">
        <div>
          <div className="skel-line skel-line--title" />
          <div className="skel-line skel-line--sub" />
        </div>
        <div className="skel-btn" />
      </div>

      <div className="skel-table">
        <div className="skel-table-head">
          {["Name", "Type", "Website", "Featured", "Actions"].map((label) => (
            <div key={label} className="skel-th">{label}</div>
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skel-table-row">
            <div className="skel-td">
              <div className="skel-line" style={{ width: "65%", height: "0.9375rem", marginBottom: "0.25rem" }} />
              <div className="skel-line" style={{ width: "40%", height: "0.6875rem" }} />
            </div>
            <div className="skel-td"><div className="skel-pill" /></div>
            <div className="skel-td"><div className="skel-line" style={{ width: "70%", height: "0.8125rem" }} /></div>
            <div className="skel-td"><div className="skel-line" style={{ width: "40%", height: "0.8125rem" }} /></div>
            <div className="skel-td skel-td--actions">
              <div className="skel-action-btn" />
              <div className="skel-action-btn" />
              <div className="skel-action-btn" />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .skel-list-root { display:flex; flex-direction:column; gap:1.5rem; max-width:960px; }
        .skel-list-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
        .skel-line { background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; border-radius: var(--radius-sm); }
        .skel-line--title { width: 130px; height: 1.375rem; margin-bottom: 0.5rem; }
        .skel-line--sub { width: 110px; height: 0.875rem; }
        .skel-btn { width: 140px; height: 40px; border-radius: var(--radius-md); background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
        .skel-pill { width: 64px; height: 22px; border-radius: 999px; background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
        .skel-action-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
        .skel-table { border-radius: var(--radius-lg); border: 1.5px solid var(--yah-light-gray); background: var(--yah-white); overflow: hidden; }
        .skel-table-head { display: grid; grid-template-columns: 2fr 1fr 1.2fr 1fr 1.5fr; gap: 1rem; padding: 0.75rem 1rem; background: var(--yah-off-white); border-bottom: 1.5px solid var(--yah-light-gray); }
        .skel-th { font-family: var(--font-heading); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--yah-slate); opacity: 0.5; }
        .skel-table-row { display: grid; grid-template-columns: 2fr 1fr 1.2fr 1fr 1.5fr; gap: 1rem; padding: 0.875rem 1rem; border-bottom: 1px solid var(--yah-light-gray); align-items: center; }
        .skel-table-row:last-child { border-bottom: none; }
        .skel-td--actions { display: flex; justify-content: flex-end; gap: 0.375rem; }
        @keyframes skel-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @media (max-width: 768px) {
          .skel-table-head, .skel-table-row { grid-template-columns: 2fr 1fr 1fr; }
          .skel-table-head > :nth-child(3), .skel-table-row > :nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}

'@

$admin_shellContent = @'
"use client";

/**
 * AdminShell
 *
 * The persistent chrome for all /admin pages:
 *  - Fixed sidebar on desktop with nav links
 *  - Topbar with page context and user menu
 *  - Slide-in mobile drawer
 *  - Sign-out action
 *
 * Receives the authenticated Supabase user from the server layout.
 *
 * @module components/admin/AdminShell
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── Idle session timeout ──────────────────────────────────────────────────────

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;       // 30 minutes
const IDLE_WARNING_MS = 1 * 60 * 1000;        // show warning 1 minute before timeout
const ACTIVITY_THROTTLE_MS = 1000;            // only reset timer once per second max

const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"] as const;

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Programs",
    href: "/admin/programs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    href: "/admin/opportunities",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Partners",
    href: "/admin/partners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ─── Logo mark ────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="var(--yah-orange)" opacity="0.15" />
      <circle cx="24" cy="24" r="16" fill="var(--yah-orange)" opacity="0.25" />
      <circle cx="24" cy="24" r="8" fill="var(--yah-orange)" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  pathname: string;
  onSignOut: () => void;
  user: User;
  onClose?: () => void;
}

function Sidebar({ pathname, onSignOut, user, onClose }: SidebarProps) {
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="admin-sidebar-brand">
        <LogoMark />
        <div className="admin-sidebar-brand-text">
          <span className="admin-sidebar-brand-name">YAH Admin</span>
          <span className="admin-sidebar-brand-sub">Executive Portal</span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="admin-sidebar-close"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="admin-nav" aria-label="Admin navigation">
        <span className="admin-nav-section-label">Content</span>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`admin-nav-item ${isActive(item.href) ? "admin-nav-item--active" : ""}`}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className="admin-nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-chip">
          <div className="admin-user-avatar" aria-hidden="true">
            {user.email?.charAt(0).toUpperCase() ?? "E"}
          </div>
          <div className="admin-user-info">
            <span className="admin-user-label">Signed in as</span>
            <span className="admin-user-email" title={user.email ?? ""}>
              {user.email}
            </span>
          </div>
        </div>
        <button onClick={onSignOut} className="admin-signout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AdminShellProps {
  user: User;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive page title from pathname
  const pageTitle =
    pathname === "/admin"
      ? "Dashboard"
      : pathname.startsWith("/admin/programs/new")
      ? "New Program"
      : pathname.startsWith("/admin/programs")
      ? "Programs"
      : pathname.startsWith("/admin/opportunities/new")
      ? "New Opportunity"
      : pathname.startsWith("/admin/opportunities")
      ? "Opportunities"
      : pathname.startsWith("/admin/partners/new")
      ? "New Partner"
      : pathname.startsWith("/admin/partners")
      ? "Partners"
      : "Admin";

  async function handleSignOut(reason?: "idle") {
    const supabase = createClient();
    await supabase.auth.signOut();
    const loginUrl = reason === "idle" ? "/admin/login?reason=idle" : "/admin/login";
    router.push(loginUrl);
    router.refresh();
  }

  const scheduleIdleTimers = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    warningTimeoutRef.current = setTimeout(() => {
      setShowIdleWarning(true);
    }, IDLE_TIMEOUT_MS - IDLE_WARNING_MS);

    idleTimeoutRef.current = setTimeout(() => {
      handleSignOut("idle");
    }, IDLE_TIMEOUT_MS);
  }, []);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;

    setShowIdleWarning(false);
    scheduleIdleTimers();
  }, [scheduleIdleTimers]);

  useEffect(() => {
    scheduleIdleTimers();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [handleActivity, scheduleIdleTimers]);

  function stayActive() {
    setShowIdleWarning(false);
    lastActivityRef.current = Date.now();
    scheduleIdleTimers();
  }

  return (
    <div className="admin-shell">

      {/* Desktop sidebar */}
      <div className="admin-sidebar-wrap">
        <Sidebar
          pathname={pathname}
          onSignOut={handleSignOut}
          user={user}
        />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="admin-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div className={`admin-drawer ${drawerOpen ? "admin-drawer--open" : ""}`}>
        <Sidebar
          pathname={pathname}
          onSignOut={handleSignOut}
          user={user}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="admin-main">

        {/* Topbar */}
        <header className="admin-topbar">
          {/* Mobile menu button */}
          <button
            className="admin-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <h1 className="admin-topbar-title">{pageTitle}</h1>

          {/* View site link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-view-site"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View site
          </a>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>

      </div>

      {/* Idle timeout warning */}
      {showIdleWarning && (
        <div className="idle-warning-overlay" role="alertdialog" aria-modal="true" aria-label="Session expiring soon">
          <div className="idle-warning-card">
            <div className="idle-warning-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="idle-warning-title">Your session is about to expire</h3>
            <p className="idle-warning-body">
              You've been inactive for a while. You'll be signed out automatically
              in about a minute to protect this account.
            </p>
            <div className="idle-warning-actions">
              <button onClick={stayActive} className="idle-stay-btn">
                Stay signed in
              </button>
              <button onClick={() => handleSignOut()} className="idle-signout-btn">
                Sign out now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── Shell layout ── */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: var(--yah-off-white);
          font-family: var(--font-body);
        }

        /* ── Sidebar (desktop) ── */
        .admin-sidebar-wrap {
          width: 256px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .admin-sidebar {
          width: 100%;
          height: 100%;
          background: var(--yah-navy);
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        /* Brand row */
        .admin-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .admin-sidebar-brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .admin-sidebar-brand-name {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--yah-white);
          line-height: 1.2;
        }

        .admin-sidebar-brand-sub {
          font-size: 0.6875rem;
          color: var(--yah-orange);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .admin-sidebar-close {
          margin-left: auto;
          color: rgba(255,255,255,0.5);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 150ms ease;
        }

        .admin-sidebar-close:hover {
          color: var(--yah-white);
        }

        /* Nav */
        .admin-nav {
          flex: 1;
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .admin-nav-section-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          padding: 0 0.625rem;
          margin-bottom: 0.375rem;
          font-family: var(--font-heading);
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          transition: background 150ms ease, color 150ms ease;
          text-decoration: none;
        }

        .admin-nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: var(--yah-white);
        }

        .admin-nav-item--active {
          background: rgba(245, 166, 35, 0.15);
          color: var(--yah-orange);
        }

        .admin-nav-item--active:hover {
          background: rgba(245, 166, 35, 0.2);
          color: var(--yah-orange);
        }

        .admin-nav-item-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        /* User footer */
        .admin-sidebar-footer {
          padding: 1rem 0.75rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .admin-user-chip {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .admin-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(245, 166, 35, 0.2);
          color: var(--yah-orange);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .admin-user-label {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }

        .admin-user-email {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-signout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          width: 100%;
          transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
          font-family: var(--font-body);
        }

        .admin-signout-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--yah-white);
          border-color: rgba(255,255,255,0.2);
        }

        /* ── Mobile drawer ── */
        .admin-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 30, 74, 0.6);
          z-index: 40;
          backdrop-filter: blur(2px);
        }

        .admin-drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 256px;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-drawer--open {
          transform: translateX(0);
        }

        /* ── Main content ── */
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* Topbar */
        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--yah-white);
          border-bottom: 1px solid var(--yah-light-gray);
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 1.5rem;
          height: 60px;
        }

        .admin-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--yah-navy);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: background 150ms ease;
        }

        .admin-menu-btn:hover {
          background: var(--yah-off-white);
        }

        .admin-topbar-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: var(--yah-navy);
          margin: 0;
          flex: 1;
        }

        .admin-view-site {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--yah-slate);
          text-decoration: none;
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--yah-light-gray);
          border-radius: var(--radius-md);
          transition: color 150ms ease, border-color 150ms ease;
          font-family: var(--font-heading);
        }

        .admin-view-site:hover {
          color: var(--yah-navy);
          border-color: var(--yah-navy);
        }

        /* Page content */
        .admin-content {
          flex: 1;
          padding: 2rem 1.5rem;
        }

        /* ── Idle timeout warning ── */
        .idle-warning-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 30, 74, 0.55);
          backdrop-filter: blur(3px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .idle-warning-card {
          background: var(--yah-white);
          border-radius: var(--radius-xl);
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(15, 30, 74, 0.25);
          text-align: center;
        }

        .idle-warning-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(217, 119, 6, 0.1);
          color: #d97706;
          margin-bottom: 1rem;
        }

        .idle-warning-title {
          font-family: var(--font-heading);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--yah-navy);
          margin: 0 0 0.625rem;
        }

        .idle-warning-body {
          font-size: 0.9375rem;
          color: var(--yah-slate);
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }

        .idle-warning-actions {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .idle-stay-btn {
          padding: 0.75rem 1.25rem;
          background: var(--yah-navy);
          color: var(--yah-white);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .idle-stay-btn:hover {
          background: var(--yah-dark);
        }

        .idle-signout-btn {
          padding: 0.625rem 1.25rem;
          background: transparent;
          color: var(--yah-slate);
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease;
        }

        .idle-signout-btn:hover {
          border-color: var(--yah-navy);
          color: var(--yah-navy);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .admin-sidebar-wrap {
            display: none;
          }

          .admin-menu-btn {
            display: flex;
          }

          .admin-content {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

'@

# --- Ensure target directories exist ---
New-Item -ItemType Directory -Force -Path "src\actions" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components\admin" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\admin\(dashboard)\partners" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\admin\(dashboard)\partners\new" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\admin\(dashboard)\partners\[slug]" | Out-Null

# --- Write files ---
$fullPath_actions = Join-Path (Get-Location) "src\actions\partners.ts"
[System.IO.File]::WriteAllText($fullPath_actions, $actionsContent, $utf8NoBom)
Write-Host "Written: src\actions\partners.ts" -ForegroundColor Green
$fullPath_table = Join-Path (Get-Location) "src\components\admin\PartnersTable.tsx"
[System.IO.File]::WriteAllText($fullPath_table, $tableContent, $utf8NoBom)
Write-Host "Written: src\components\admin\PartnersTable.tsx" -ForegroundColor Green
$fullPath_form = Join-Path (Get-Location) "src\components\admin\PartnerForm.tsx"
[System.IO.File]::WriteAllText($fullPath_form, $formContent, $utf8NoBom)
Write-Host "Written: src\components\admin\PartnerForm.tsx" -ForegroundColor Green
$fullPath_list_page = Join-Path (Get-Location) "src\app\admin\(dashboard)\partners\page.tsx"
[System.IO.File]::WriteAllText($fullPath_list_page, $list_pageContent, $utf8NoBom)
Write-Host "Written: src\app\admin\(dashboard)\partners\page.tsx" -ForegroundColor Green
$fullPath_new_page = Join-Path (Get-Location) "src\app\admin\(dashboard)\partners\new\page.tsx"
[System.IO.File]::WriteAllText($fullPath_new_page, $new_pageContent, $utf8NoBom)
Write-Host "Written: src\app\admin\(dashboard)\partners\new\page.tsx" -ForegroundColor Green
$fullPath_edit_page = Join-Path (Get-Location) "src\app\admin\(dashboard)\partners\[slug]\page.tsx"
[System.IO.File]::WriteAllText($fullPath_edit_page, $edit_pageContent, $utf8NoBom)
Write-Host "Written: src\app\admin\(dashboard)\partners\[slug]\page.tsx" -ForegroundColor Green
$fullPath_loading_page = Join-Path (Get-Location) "src\app\admin\(dashboard)\partners\loading.tsx"
[System.IO.File]::WriteAllText($fullPath_loading_page, $loading_pageContent, $utf8NoBom)
Write-Host "Written: src\app\admin\(dashboard)\partners\loading.tsx" -ForegroundColor Green
$fullPath_admin_shell = Join-Path (Get-Location) "src\components\admin\AdminShell.tsx"
[System.IO.File]::WriteAllText($fullPath_admin_shell, $admin_shellContent, $utf8NoBom)
Write-Host "Written: src\components\admin\AdminShell.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying contents..." -ForegroundColor Cyan
$check_actions = Get-Content -LiteralPath "src\actions\partners.ts" -Raw
if ($check_actions -match [regex]::Escape("createPartner")) { Write-Host "OK: src\actions\partners.ts contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\actions\partners.ts missing expected content (createPartner)" -ForegroundColor Red }
$check_table = Get-Content -LiteralPath "src\components\admin\PartnersTable.tsx" -Raw
if ($check_table -match [regex]::Escape("PartnersTable")) { Write-Host "OK: src\components\admin\PartnersTable.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\components\admin\PartnersTable.tsx missing expected content (PartnersTable)" -ForegroundColor Red }
$check_form = Get-Content -LiteralPath "src\components\admin\PartnerForm.tsx" -Raw
if ($check_form -match [regex]::Escape("PartnerForm")) { Write-Host "OK: src\components\admin\PartnerForm.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\components\admin\PartnerForm.tsx missing expected content (PartnerForm)" -ForegroundColor Red }
$check_list_page = Get-Content -LiteralPath "src\app\admin\(dashboard)\partners\page.tsx" -Raw
if ($check_list_page -match [regex]::Escape("AdminPartnersPage")) { Write-Host "OK: src\app\admin\(dashboard)\partners\page.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\admin\(dashboard)\partners\page.tsx missing expected content (AdminPartnersPage)" -ForegroundColor Red }
$check_new_page = Get-Content -LiteralPath "src\app\admin\(dashboard)\partners\new\page.tsx" -Raw
if ($check_new_page -match [regex]::Escape("NewPartnerPage")) { Write-Host "OK: src\app\admin\(dashboard)\partners\new\page.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\admin\(dashboard)\partners\new\page.tsx missing expected content (NewPartnerPage)" -ForegroundColor Red }
$check_edit_page = Get-Content -LiteralPath "src\app\admin\(dashboard)\partners\[slug]\page.tsx" -Raw
if ($check_edit_page -match [regex]::Escape("EditPartnerPage")) { Write-Host "OK: src\app\admin\(dashboard)\partners\[slug]\page.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\admin\(dashboard)\partners\[slug]\page.tsx missing expected content (EditPartnerPage)" -ForegroundColor Red }
$check_loading_page = Get-Content -LiteralPath "src\app\admin\(dashboard)\partners\loading.tsx" -Raw
if ($check_loading_page -match [regex]::Escape("PartnersLoading")) { Write-Host "OK: src\app\admin\(dashboard)\partners\loading.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\admin\(dashboard)\partners\loading.tsx missing expected content (PartnersLoading)" -ForegroundColor Red }
$check_admin_shell = Get-Content -LiteralPath "src\components\admin\AdminShell.tsx" -Raw
if ($check_admin_shell -match [regex]::Escape("label: `"Partners`"")) { Write-Host "OK: src\components\admin\AdminShell.tsx contains expected content" -ForegroundColor Green } else { Write-Host "PROBLEM: src\components\admin\AdminShell.tsx missing expected content (label: `"Partners`")" -ForegroundColor Red }

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "REMINDER: Make sure you already ran add-partner-enum.sql in Supabase" -ForegroundColor Yellow
Write-Host "Then visit /admin/partners to test the new admin section." -ForegroundColor Cyan
