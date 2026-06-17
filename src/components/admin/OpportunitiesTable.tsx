"use client";

/**
 * OpportunitiesTable
 *
 * Interactive table for the /admin/opportunities page.
 * Handles:
 *  - Status badge display
 *  - Featured badge
 *  - Toggle open/closed in-place via Supabase
 *  - Delete with confirmation modal
 *  - Link to edit page
 *
 * @module components/admin/OpportunitiesTable
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/types/opportunity";
import { revalidatePublicPages, OPPORTUNITY_PATHS } from "@/lib/revalidate";


// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Opportunity["status"] }) {
  const map = {
    open:          { label: "Open",        color: "#16a34a", bg: "rgba(22,163,74,0.1)"  },
    closed:        { label: "Closed",      color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
    "coming-soon": { label: "Coming soon", color: "#d97706", bg: "rgba(217,119,6,0.1)"  },
  };
  const s = map[status];
  return (
    <span className="tbl-badge" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

export default function OpportunitiesTable({ opportunities: initial }: OpportunitiesTableProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState(initial);
  const [loadingSlug,   setLoadingSlug]   = useState<string | null>(null);
  const [deleteSlug,    setDeleteSlug]    = useState<string | null>(null);
  const [error,         setError]         = useState<string | null>(null);

  async function handleToggleStatus(opp: Opportunity) {
    setLoadingSlug(opp.slug);
    setError(null);

    const newStatus = opp.status === "open" ? "closed" : "open";
    const supabase  = createClient();

    const { error } = await supabase
      .from("opportunities")
      .update({ status: newStatus })
      .eq("slug", opp.slug);

    if (error) {
      setError(`Failed to update status: ${error.message}`);
    } else {
      setOpportunities((prev) =>
        prev.map((o) => (o.slug === opp.slug ? { ...o, status: newStatus } : o))
      );
      await revalidatePublicPages([
        OPPORTUNITY_PATHS.list,
        OPPORTUNITY_PATHS.detail(opp.slug),
        OPPORTUNITY_PATHS.home,
      ]);
    }
    setLoadingSlug(null);
  }

  async function handleDelete(slug: string) {
    setLoadingSlug(slug);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("opportunities").delete().eq("slug", slug);

    if (error) {
      setError(`Failed to delete: ${error.message}`);
      setLoadingSlug(null);
    } else {
      setOpportunities((prev) => prev.filter((o) => o.slug !== slug));
      setDeleteSlug(null);
      setLoadingSlug(null);
      await revalidatePublicPages([
          OPPORTUNITY_PATHS.list,
          OPPORTUNITY_PATHS.detail(slug),
          OPPORTUNITY_PATHS.home,
      ]);
      router.refresh();
    }
  }

  return (
    <div className="tbl-wrap">
      {error && (
        <div className="tbl-error" role="alert">{error}</div>
      )}

      {/* Delete confirmation modal */}
      {deleteSlug && (
        <div className="tbl-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="tbl-modal">
            <h3 className="tbl-modal-title">Delete opportunity?</h3>
            <p className="tbl-modal-body">
              This will permanently delete{" "}
              <strong>{opportunities.find((o) => o.slug === deleteSlug)?.title}</strong>.
              This action cannot be undone.
            </p>
            <div className="tbl-modal-actions">
              <button
                className="tbl-btn tbl-btn--ghost"
                onClick={() => setDeleteSlug(null)}
                disabled={loadingSlug === deleteSlug}
              >
                Cancel
              </button>
              <button
                className="tbl-btn tbl-btn--danger"
                onClick={() => handleDelete(deleteSlug)}
                disabled={loadingSlug === deleteSlug}
              >
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
              <th className="tbl-th">Title</th>
              <th className="tbl-th">Category</th>
              <th className="tbl-th">Provider</th>
              <th className="tbl-th">Status</th>
              <th className="tbl-th">Featured</th>
              <th className="tbl-th">Deadline</th>
              <th className="tbl-th tbl-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.slug} className="tbl-row">

                {/* Title */}
                <td className="tbl-td">
                  <span className="tbl-title">{opp.title}</span>
                  <span className="tbl-slug">{opp.slug}</span>
                </td>

                {/* Category */}
                <td className="tbl-td">
                  <span className="tbl-category">{opp.category}</span>
                </td>

                {/* Provider */}
                <td className="tbl-td">
                  <span className="tbl-provider">{opp.provider}</span>
                </td>

                {/* Status */}
                <td className="tbl-td">
                  <StatusBadge status={opp.status} />
                </td>

                {/* Featured */}
                <td className="tbl-td">
                  {opp.featured ? (
                    <span className="tbl-badge" style={{ color: "var(--yah-sky)", background: "rgba(74,159,212,0.1)" }}>
                      Featured
                    </span>
                  ) : (
                    <span className="tbl-muted">—</span>
                  )}
                </td>

                {/* Deadline */}
                <td className="tbl-td">
                  {opp.deadline ? (
                    <span className="tbl-date">
                      {new Date(opp.deadline).toLocaleDateString("en-ZW", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="tbl-muted">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="tbl-td tbl-td--actions">
                  <Link
                    href={`/admin/opportunities/${opp.slug}`}
                    className="tbl-btn tbl-btn--ghost"
                    aria-label={`Edit ${opp.title}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </Link>

                  <button
                    className={`tbl-btn ${opp.status === "open" ? "tbl-btn--warning" : "tbl-btn--success"}`}
                    onClick={() => handleToggleStatus(opp)}
                    disabled={loadingSlug === opp.slug}
                    aria-label={opp.status === "open" ? `Close ${opp.title}` : `Open ${opp.title}`}
                  >
                    {loadingSlug === opp.slug ? "…" : opp.status === "open" ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                        Close
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                        Open
                      </>
                    )}
                  </button>

                  <button
                    className="tbl-btn tbl-btn--danger-ghost"
                    onClick={() => setDeleteSlug(opp.slug)}
                    disabled={loadingSlug === opp.slug}
                    aria-label={`Delete ${opp.title}`}
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
        .tbl { width:100%; border-collapse:collapse; font-size:0.875rem; min-width:780px; }
        .tbl-th { padding:0.75rem 1rem; text-align:left; font-family:var(--font-heading); font-size:0.75rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--yah-slate); background:var(--yah-off-white); border-bottom:1.5px solid var(--yah-light-gray); white-space:nowrap; }
        .tbl-th--actions { text-align:right; }
        .tbl-row { border-bottom:1px solid var(--yah-light-gray); transition:background 150ms ease; }
        .tbl-row:last-child { border-bottom:none; }
        .tbl-row:hover { background:var(--yah-off-white); }
        .tbl-td { padding:0.875rem 1rem; vertical-align:middle; }
        .tbl-td--actions { text-align:right; white-space:nowrap; }
        .tbl-title { display:block; font-family:var(--font-heading); font-weight:600; color:var(--yah-navy); font-size:0.875rem; }
        .tbl-slug { display:block; font-size:0.75rem; color:var(--yah-slate); margin-top:0.125rem; opacity:0.7; }
        .tbl-category { font-size:0.8125rem; color:var(--yah-slate); text-transform:capitalize; }
        .tbl-provider { font-size:0.8125rem; color:var(--yah-slate); }
        .tbl-badge { display:inline-flex; align-items:center; padding:0.2rem 0.625rem; border-radius:999px; font-size:0.75rem; font-weight:600; font-family:var(--font-heading); white-space:nowrap; }
        .tbl-date { font-size:0.8125rem; color:var(--yah-slate); white-space:nowrap; }
        .tbl-muted { color:var(--yah-light-gray); font-size:0.875rem; }

        .tbl-btn { display:inline-flex; align-items:center; gap:0.3rem; padding:0.375rem 0.625rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:600; font-family:var(--font-heading); cursor:pointer; border:1px solid transparent; transition:background 150ms ease, color 150ms ease, border-color 150ms ease; text-decoration:none; white-space:nowrap; }
        .tbl-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .tbl-btn--ghost { background:transparent; color:var(--yah-navy); border-color:var(--yah-light-gray); }
        .tbl-btn--ghost:hover:not(:disabled) { background:var(--yah-off-white); border-color:var(--yah-navy); }
        .tbl-btn--success { background:rgba(22,163,74,0.08); color:#16a34a; border-color:rgba(22,163,74,0.2); }
        .tbl-btn--success:hover:not(:disabled) { background:rgba(22,163,74,0.15); }
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
