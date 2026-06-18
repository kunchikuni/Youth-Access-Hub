/**
 * Admin Dashboard Overview
 * Route: /admin
 *
 * Server Component — fetches live counts from Supabase
 * and renders a summary of content across the site.
 *
 * @module app/admin/page
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — YAH Admin" };

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  accent: string;
  href: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, accent, href, icon }: StatCardProps) {
  return (
    <Link href={href} className="dash-stat-card" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <span className="dash-stat-value">{value}</span>
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-sub">{sub}</span>
      </div>
      <div className="dash-stat-arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ label, desc, href, icon }: QuickActionProps) {
  return (
    <Link href={href} className="dash-action-card">
      <span className="dash-action-icon">{icon}</span>
      <span className="dash-action-text">
        <span className="dash-action-label">{label}</span>
        <span className="dash-action-desc">{desc}</span>
      </span>
      <svg className="dash-action-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [
    { count: totalPrograms },
    { count: openPrograms },
    { count: totalOpportunities },
    { count: openOpportunities },
    { count: featuredPrograms },
    { count: featuredOpportunities },
  ] = await Promise.all([
    supabase.from("programs").select("*", { count: "exact", head: true }),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("opportunities").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("featured", true),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("featured", true),
  ]);

  return (
    <div className="dash-root">

      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <h2 className="dash-welcome-title">Welcome back</h2>
          <p className="dash-welcome-sub">
            Here's a live snapshot of the YAH website content.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <section aria-label="Content overview">
        <h3 className="dash-section-label">Content overview</h3>
        <div className="dash-stats-grid">
          <StatCard
            label="Programs"
            value={totalPrograms ?? 0}
            sub={`${openPrograms ?? 0} open · ${featuredPrograms ?? 0} featured`}
            accent="var(--yah-navy)"
            href="/admin/programs"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="Opportunities"
            value={totalOpportunities ?? 0}
            sub={`${openOpportunities ?? 0} open · ${featuredOpportunities ?? 0} featured`}
            accent="var(--yah-teal)"
            href="/admin/opportunities"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h3 className="dash-section-label">Quick actions</h3>
        <div className="dash-actions-list">
          <QuickAction
            label="Add a new program"
            desc="Create a mentorship, skills, or leadership program"
            href="/admin/programs/new"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="19" y1="8" x2="19" y2="14" stroke="var(--yah-teal)" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="11" x2="22" y2="11" stroke="var(--yah-teal)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <QuickAction
            label="Add a new opportunity"
            desc="Post an internship, grant, scholarship, or volunteer placement"
            href="/admin/opportunities/new"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="var(--yah-teal)" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="var(--yah-teal)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <QuickAction
            label="Manage programs"
            desc="Edit, publish, unpublish, or delete existing programs"
            href="/admin/programs"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <QuickAction
            label="Manage opportunities"
            desc="Edit, publish, unpublish, or delete existing opportunities"
            href="/admin/opportunities"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </section>

      <style>{`
        .dash-root {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 860px;
        }

        /* Welcome */
        .dash-welcome {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .dash-welcome-title {
          font-family: var(--font-heading);
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--yah-navy);
          margin: 0 0 0.25rem;
        }

        .dash-welcome-sub {
          font-size: 0.9375rem;
          color: var(--yah-slate);
          margin: 0;
        }

        /* Section label */
        .dash-section-label {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--yah-slate);
          margin: 0 0 0.875rem;
        }

        /* Stats grid */
        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .dash-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--yah-white);
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-lg);
          padding: 1.375rem 1.25rem;
          text-decoration: none;
          transition: box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease;
          position: relative;
          overflow: hidden;
        }

        .dash-stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--accent);
          border-radius: 4px 0 0 4px;
        }

        .dash-stat-card:hover {
          box-shadow: var(--shadow-hover);
          border-color: transparent;
          transform: translateY(-2px);
        }

        .dash-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--yah-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .dash-stat-body {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .dash-stat-value {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--yah-navy);
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .dash-stat-label {
          font-family: var(--font-heading);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--yah-navy);
        }

        .dash-stat-sub {
          font-size: 0.75rem;
          color: var(--yah-slate);
          margin-top: 0.125rem;
        }

        .dash-stat-arrow {
          color: var(--yah-slate);
          opacity: 0.4;
          flex-shrink: 0;
          transition: opacity 200ms ease, transform 200ms ease;
        }

        .dash-stat-card:hover .dash-stat-arrow {
          opacity: 0.8;
          transform: translateX(3px);
        }

        /* Quick actions */
        .dash-actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .dash-action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--yah-white);
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-md);
          padding: 1rem 1.125rem;
          text-decoration: none;
          transition: box-shadow 200ms ease, border-color 200ms ease;
        }

        .dash-action-card:hover {
          border-color: var(--yah-navy);
          box-shadow: var(--shadow-card);
        }

        .dash-action-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--yah-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--yah-navy);
          flex-shrink: 0;
        }

        .dash-action-text {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .dash-action-label {
          font-family: var(--font-heading);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--yah-navy);
        }

        .dash-action-desc {
          font-size: 0.8125rem;
          color: var(--yah-slate);
          margin-top: 0.125rem;
        }

        .dash-action-arrow {
          color: var(--yah-slate);
          opacity: 0.4;
          flex-shrink: 0;
          transition: opacity 200ms ease, transform 200ms ease;
        }

        .dash-action-card:hover .dash-action-arrow {
          opacity: 0.8;
          transform: translateX(3px);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .dash-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
