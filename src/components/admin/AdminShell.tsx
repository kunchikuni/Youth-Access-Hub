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

// --- Idle session timeout ------------------------------------------------------

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;       // 30 minutes
const IDLE_WARNING_MS = 1 * 60 * 1000;        // show warning 1 minute before timeout
const ACTIVITY_THROTTLE_MS = 1000;            // only reset timer once per second max

const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"] as const;

// --- Nav items ----------------------------------------------------------------

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

// --- Logo mark ----------------------------------------------------------------

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="var(--yah-orange)" opacity="0.15" />
      <circle cx="24" cy="24" r="16" fill="var(--yah-orange)" opacity="0.25" />
      <circle cx="24" cy="24" r="8" fill="var(--yah-orange)" />
    </svg>
  );
}

// --- Sidebar -----------------------------------------------------------------

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

// --- Shell --------------------------------------------------------------------

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
        /* -- Shell layout -- */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: var(--yah-off-white);
          font-family: var(--font-body);
        }

        /* -- Sidebar (desktop) -- */
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

        /* -- Mobile drawer -- */
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

        /* -- Main content -- */
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

        /* -- Idle timeout warning -- */
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

        /* -- Responsive -- */
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
