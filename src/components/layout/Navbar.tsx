"use client";
// import Image from '/images/yaah_logo.jpg'
/**
 * Navbar Component
 *
 * Responsive site navigation for Youth Access Hub.
 *
 * Features:
 *  - Full desktop nav with all primary links
 *  - Hamburger-triggered mobile slide-down menu
 *  - Active link highlighting via usePathname()
 *  - Scroll-aware background: transparent at top, solid navy on scroll
 *  - Skip-to-content link for keyboard/screen reader accessibility
 *  - CTA button ("Get Connected") prominent on all viewports
 *
 * @module components/layout/Navbar
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Nav Links Config ──────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /** Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /** Detect scroll position for background transition */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold"
        style={{
          backgroundColor: "var(--yah-orange)",
          color: "var(--yah-navy)",
        }}
      >
        Skip to main content
      </a>

      {/* ── Nav Bar ───────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || mobileOpen
            ? "shadow-md"
            : "shadow-none"
        )}
        style={{
          backgroundColor: "var(--yah-navy)",
        }}
      >
        <div className="container-yah">
          <nav
            className="flex items-center justify-between h-16 md:h-20"
            aria-label="Main navigation"
          >
            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0 group"
              aria-label="Youth Access Hub — Home"
            >
              {/* Logo mark — door + figure icon built in SVG */}
              <img
                  src="/images/yah_logo.png" // Path to your file in the /public folder
                  alt="Youth Access Hub Logo"
                  width={40}
                  height={40}
                  className="flex-shrink-0 object-contain"
              />


              {/*<svg*/}
              {/*  width="40"*/}
              {/*  height="40"*/}
              {/*  viewBox="0 0 40 40"*/}
              {/*  fill="none"*/}
              {/*  xmlns="http://www.w3.org/2000/svg"*/}
              {/*  aria-hidden="true"*/}
              {/*  className="flex-shrink-0"*/}
              {/*>*/}
              {/*  /!* Door frame — orange left, teal right *!/*/}
              {/*  <rect x="4" y="6" width="14" height="28" rx="1" fill="#F5A623" />*/}
              {/*  <rect x="22" y="6" width="14" height="28" rx="1" fill="#2BAE8E" />*/}
              {/*  /!* Running figure — sky blue *!/*/}
              {/*  <circle cx="20" cy="14" r="3" fill="#4A9FD4" />*/}
              {/*  <path*/}
              {/*    d="M17 20 C17 20 18 18 20 18 C22 18 23 20 23 20 L25 26 M20 18 L18 26"*/}
              {/*    stroke="#4A9FD4"*/}
              {/*    strokeWidth="2"*/}
              {/*    strokeLinecap="round"*/}
              {/*  />*/}
              {/*</svg>*/}

              {/* Wordmark */}
              <span className="hidden sm:flex flex-col leading-tight">
                <span
                  className="text-base font-bold tracking-wide"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)" }}
                >
                  Youth Access Hub
                </span>
                <span
                  className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: "var(--yah-orange)" }}
                >
                  Empowering Youth
                </span>
              </span>
            </Link>

            {/* ── Desktop Links ──────────────────────────────────────── */}
            <ul className="hidden lg:flex items-center gap-1" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      "after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:transition-transform after:duration-200",
                      isActive(href)
                        ? "after:scale-x-100 after:bg-[var(--yah-orange)]"
                        : "after:scale-x-0 hover:after:scale-x-100 hover:after:bg-[var(--yah-teal)]"
                    )}
                    style={{
                      color: isActive(href)
                        ? "var(--yah-orange)"
                        : "rgba(255,255,255,0.85)",
                    }}
                    aria-current={isActive(href) ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── CTA + Hamburger ────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              {/* CTA Button — desktop */}
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "var(--yah-orange)",
                  color: "var(--yah-navy)",
                  fontFamily: "var(--font-heading)",
                  boxShadow: "var(--shadow-orange)",
                }}
              >
                Get Connected
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              {/* Hamburger — mobile */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-md gap-1.5 transition-colors duration-200"
                style={{ color: "var(--yah-white)" }}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <span
                  className={cn(
                    "block w-6 h-0.5 rounded-full transition-all duration-300 origin-center",
                    mobileOpen ? "rotate-45 translate-y-2" : ""
                  )}
                  style={{ backgroundColor: "var(--yah-white)" }}
                />
                <span
                  className={cn(
                    "block w-6 h-0.5 rounded-full transition-all duration-300",
                    mobileOpen ? "opacity-0 scale-x-0" : ""
                  )}
                  style={{ backgroundColor: "var(--yah-white)" }}
                />
                <span
                  className={cn(
                    "block w-6 h-0.5 rounded-full transition-all duration-300 origin-center",
                    mobileOpen ? "-rotate-45 -translate-y-2" : ""
                  )}
                  style={{ backgroundColor: "var(--yah-white)" }}
                />
              </button>
            </div>
          </nav>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────── */}
        <div
          id="mobile-menu"
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          )}
          style={{ borderTop: mobileOpen ? "1px solid rgba(255,255,255,0.1)" : "none" }}
          aria-hidden={!mobileOpen}
        >
          <div className="container-yah py-4 pb-6">
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-150",
                      isActive(href)
                        ? "font-semibold"
                        : "hover:bg-white/10"
                    )}
                    style={{
                      color: isActive(href) ? "var(--yah-orange)" : "rgba(255,255,255,0.9)",
                      backgroundColor: isActive(href) ? "rgba(245,166,35,0.12)" : undefined,
                    }}
                    aria-current={isActive(href) ? "page" : undefined}
                    tabIndex={mobileOpen ? 0 : -1}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA — mobile */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-base font-semibold transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: "var(--yah-orange)",
                  color: "var(--yah-navy)",
                  fontFamily: "var(--font-heading)",
                }}
                tabIndex={mobileOpen ? 0 : -1}
              >
                Get Connected
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Spacer — prevents content hiding behind fixed nav ─────────── */}
      <div className="h-16 md:h-20" aria-hidden="true" />
    </>
  );
}
