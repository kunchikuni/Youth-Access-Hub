/**
 * New Program Page
 * Route: /admin/programs/new
 *
 * Server Component — renders ProgramForm in create mode (no initial data).
 *
 * @module app/admin/programs/new/page
 */

import ProgramForm from "@/components/admin/ProgramForm";

export const metadata = { title: "New Program — YAH Admin" };

export default function NewProgramPage() {
  return (
    <div className="np-root">
      <div className="np-header">
        <h2 className="np-title">New program</h2>
        <p className="np-sub">
          Fill in the details below. The program will be saved and visible on
          the website according to its status.
        </p>
      </div>

      <ProgramForm />

      <style>{`
        .np-root { display:flex; flex-direction:column; gap:1.5rem; }
        .np-header { max-width:780px; }
        .np-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .np-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
      `}</style>
    </div>
  );
}
