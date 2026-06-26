/**
 * Admin Partners List
 * Route: /admin/partners
 *
 * Server Component - fetches all partners from Supabase.
 *
 * @module app/admin/(dashboard)/partners/page
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PartnersTable from "@/components/admin/PartnersTable";
import type { Partner } from "@/types/partner";

export const metadata = { title: "Partners - YAH Admin" };

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
