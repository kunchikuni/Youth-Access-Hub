/**
 * Admin Programs List
 * Route: /admin/programs
 *
 * Server Component â€” fetches all programs from Supabase.
 * Renders a table with status badges, featured toggle info,
 * and links to edit or create programs.
 *
 * @module app/admin/(dashboard)/programs/page
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProgramsTable from "@/components/admin/ProgramsTable";
import type { Program } from "@/types/program";

export const metadata = { title: "Programs â€” YAH Admin" };

export default async function AdminProgramsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: false });

  const programs = (data ?? []) as Program[];

  return (
    <div className="prog-root">

      {/* Header */}
      <div className="prog-header">
        <div>
          <h2 className="prog-title">Programs</h2>
          <p className="prog-sub">
            {programs.length} program{programs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/programs/new" className="prog-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New program
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="prog-error" role="alert">
          Failed to load programs: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!error && programs.length === 0 && (
        <div className="prog-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No programs yet.</p>
          <Link href="/admin/programs/new" className="prog-add-btn">
            Add the first program
          </Link>
        </div>
      )}

      {/* Table */}
      {!error && programs.length > 0 && (
        <ProgramsTable programs={programs} />
      )}

      <style>{`
        .prog-root {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 960px;
        }

        .prog-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .prog-title {
          font-family: var(--font-heading);
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--yah-navy);
          margin: 0 0 0.125rem;
        }

        .prog-sub {
          font-size: 0.875rem;
          color: var(--yah-slate);
          margin: 0;
        }

        .prog-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.125rem;
          background: var(--yah-navy);
          color: var(--yah-white);
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 150ms ease, transform 150ms ease;
          white-space: nowrap;
        }

        .prog-add-btn:hover {
          background: var(--yah-dark);
          transform: translateY(-1px);
        }

        .prog-error {
          padding: 1rem 1.25rem;
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: var(--radius-md);
          color: #dc2626;
          font-size: 0.875rem;
        }

        .prog-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 4rem 2rem;
          background: var(--yah-white);
          border: 1.5px dashed var(--yah-light-gray);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .prog-empty p {
          font-size: 0.9375rem;
          color: var(--yah-slate);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
