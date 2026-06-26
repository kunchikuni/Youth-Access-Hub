"use client";

/**
 * PartnersTable
 *
 * Interactive table for the /admin/partners page.
 * Unlike ProgramsTable/OpportunitiesTable, there is no open/closed
 * status - only a featured toggle and delete (with confirmation).
 * All mutations call server actions in src/actions/partners.ts.
 *
 * @module components/admin/PartnersTable
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePartnerFeatured, deletePartner } from "@/actions/partners";
import type { Partner } from "@/types/partner";

// --- Type badge ---------------------------------------------------------------

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

// --- Component ----------------------------------------------------------------

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
                {loadingSlug === deleteSlug ? "Deleting..." : "Yes, delete"}
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
                    <span className="tbl-muted">-</span>
                  )}
                </td>

                <td className="tbl-td">
                  {partner.featured ? (
                    <span className="tbl-badge" style={{ color: "var(--yah-sky)", background: "rgba(74,159,212,0.1)" }}>
                      Featured
                    </span>
                  ) : (
                    <span className="tbl-muted">-</span>
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
                    {loadingSlug === partner.slug ? "..." : partner.featured ? (
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
