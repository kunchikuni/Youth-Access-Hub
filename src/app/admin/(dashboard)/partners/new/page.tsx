/**
 * New Partner Page
 * Route: /admin/partners/new
 *
 * Server Component - renders PartnerForm in create mode.
 *
 * @module app/admin/(dashboard)/partners/new/page
 */

import PartnerForm from "@/components/admin/PartnerForm";

export const metadata = { title: "New Partner - YAH Admin" };

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
