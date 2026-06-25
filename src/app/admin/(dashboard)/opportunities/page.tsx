/**
 * Admin Opportunities List
 * Route: /admin/opportunities
 *
 * Server Component â€” fetches all opportunities from Supabase.
 *
 * @module app/admin/(dashboard)/opportunities/page
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OpportunitiesTable from "@/components/admin/OpportunitiesTable";
import type { Opportunity } from "@/types/opportunity";

export const metadata = { title: "Opportunities â€” YAH Admin" };

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  const opportunities = (data ?? []) as Opportunity[];

  return (
    <div className="opp-root">

      <div className="opp-header">
        <div>
          <h2 className="opp-title">Opportunities</h2>
          <p className="opp-sub">
            {opportunities.length} opportunit{opportunities.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <Link href="/admin/opportunities/new" className="opp-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New opportunity
        </Link>
      </div>

      {error && (
        <div className="opp-error" role="alert">
          Failed to load opportunities: {error.message}
        </div>
      )}

      {!error && opportunities.length === 0 && (
        <div className="opp-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
            <path d="M12 8v4l3 3" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p>No opportunities yet.</p>
          <Link href="/admin/opportunities/new" className="opp-add-btn">
            Add the first opportunity
          </Link>
        </div>
      )}

      {!error && opportunities.length > 0 && (
        <OpportunitiesTable opportunities={opportunities} />
      )}

      <style>{`
        .opp-root { display:flex; flex-direction:column; gap:1.5rem; max-width:960px; }
        .opp-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
        .opp-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; }
        .opp-sub { font-size:0.875rem; color:var(--yah-slate); margin:0; }
        .opp-add-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.125rem; background:var(--yah-navy); color:var(--yah-white); border-radius:var(--radius-md); font-family:var(--font-heading); font-size:0.875rem; font-weight:600; text-decoration:none; transition:background 150ms ease, transform 150ms ease; white-space:nowrap; }
        .opp-add-btn:hover { background:var(--yah-dark); transform:translateY(-1px); }
        .opp-error { padding:1rem 1.25rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; }
        .opp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:4rem 2rem; background:var(--yah-white); border:1.5px dashed var(--yah-light-gray); border-radius:var(--radius-lg); text-align:center; }
        .opp-empty p { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
      `}</style>
    </div>
  );
}
