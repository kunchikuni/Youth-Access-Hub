/**
 * Footer Component
 *
 * Site-wide footer for Youth Access Hub.
 *
 * Sections:
 *  - Brand column: logo, tagline, brief mission statement
 *  - Quick Links: main navigation
 *  - Get Involved: programs, opportunities, contact
 *  - Connect: social media links + contact info
 *  - Bottom bar: copyright + legal links
 *
 * Server component — no client interactivity required.
 *
 * @module components/layout/Footer
 */

import Link from "next/link";

// ─── Link Columns Config ───────────────────────────────────────────────────

const FOOTER_COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/about#how-it-works" },
      { label: "Our Partners", href: "/partners" },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { label: "Mentorship Programs", href: "/programs" },
      { label: "Opportunities", href: "/opportunities" },
      { label: "Become a Mentor", href: "/contact?ref=mentor" },
      { label: "Partner With Us", href: "/contact?ref=partner" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61588046655274",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ backgroundColor: "var(--yah-navy)", color: "rgba(255,255,255,0.75)" }}
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* ── Wave separator ──────────────────────────────────────────── */}
      <div
        style={{ backgroundColor: "var(--yah-teal)", lineHeight: 0 }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 md:h-14"
          style={{ display: "block", fill: "var(--yah-navy)" }}
        >
          <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
        </svg>
      </div>

      {/* ── Main footer content ─────────────────────────────────────── */}
      <div className="container-yah pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand Column ───────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-4 group"
              aria-label="Youth Access Hub home"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="4" y="6" width="14" height="28" rx="1" fill="#F5A623" />
                <rect x="22" y="6" width="14" height="28" rx="1" fill="#2BAE8E" />
                <circle cx="20" cy="14" r="3" fill="#4A9FD4" />
                <path
                  d="M17 20 C17 20 18 18 20 18 C22 18 23 20 23 20 L25 26 M20 18 L18 26"
                  stroke="#4A9FD4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="text-sm font-bold tracking-wide"
                style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)" }}
              >
                Youth Access Hub
              </span>
            </Link>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
              Connecting young people to mentorship, opportunities, and support through strong cross-sector partnerships across Zimbabwe.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3" role="list" aria-label="Social media links">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  role="listitem"
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.75)] hover:bg-[var(--yah-teal)] hover:text-[var(--yah-white)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ───────────────────────────────────────── */}
          {FOOTER_COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <h3
                className="text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}
              >
                {heading}
              </h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150 hover:underline underline-offset-4 text-[rgba(255,255,255,0.7)] hover:text-[var(--yah-teal)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Contact Column ─────────────────────────────────────── */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}
            >
              Contact Us
            </h3>
            <ul className="flex flex-col gap-3" role="list">
              <li className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0" style={{ color: "var(--yah-teal)" }} aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Harare, Zimbabwe
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0" style={{ color: "var(--yah-teal)" }} aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:info@youthaccesshub.org"
                  className="text-sm transition-colors duration-150 text-[rgba(255,255,255,0.7)] hover:text-[var(--yah-teal)]"
                >
                  info@youthaccesshub.org
                </a>
              </li>
              <li className="flex items-start gap-0.2">
                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mt-0.5 flex-shrink-0" style={{ color: "var(--yah-teal)" }} aria-hidden="true">
                <path d='M14.842 12.045l-1.931-.55a.723.723 0 0 0-.713.186l-.472.478a.707.707 0 0 1-.765.16c-.913-.367-2.835-2.063-3.326-2.912a.694.694 0 0 1 .056-.774l.412-.53a.71.71 0 0 0 .089-.726L7.38 5.553a.723.723 0 0 0-1.125-.256c-.539.453-1.179 1.14-1.256 1.903-.137 1.343.443 3.036 2.637 5.07 2.535 2.349 4.566 2.66 5.887 2.341.75-.18 1.35-.903 1.727-1.494a.713.713 0 0 0-.408-1.072z'/>
                </svg>
                 <Link
                    href="https://wa.me/263712232743"
                    className="text-sm transtion-colors duration-150 text-[rgba(255,255,255,0.7)] hover:text-[var(--yah-teal)]"
                >
                    +263 71 223 2743
              </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Link
              href="https://cyaen.co.zw"
            className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}
              >
            © {currentYear} Wivae Devs. All rights reserved.
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-150 hover:underline underline-offset-4"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Privacy Policy
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }} aria-hidden="true">·</span>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-150 hover:underline underline-offset-4"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
