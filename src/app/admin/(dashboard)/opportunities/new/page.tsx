/**
 * New Opportunity Page
 * Route: /admin/opportunities/new
 *
 * Server Component — renders OpportunityForm in create mode.
 *
 * @module app/admin/opportunities/new/page
 */

import OpportunityForm from "@/components/admin/OpportunityForm";

export const metadata = { title: "New Opportunity — YAH Admin" };

export default function NewOpportunityPage() {
  return (
    <div className="no-root">
      <div className="no-header">
        <h2 className="no-title">New opportunity</h2>
        <p className="no-sub">
          Fill in the details below. The opportunity will be visible on the
          website according to its status.
        </p>
      </div>

      <OpportunityForm />

      <style>{`
        .no-root { display:flex; flex-direction:column; gap:1.5rem; }
        .no-header { max-width:780px; }
        .no-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .no-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
      `}</style>
    </div>
  );
}
