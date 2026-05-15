/**
 * CTABanner Section
 *
 * Full-width call-to-action band shown near the bottom of the homepage.
 * Two variants of action — one for youth (get connected) and one for
 * professionals/organisations (become a partner or mentor).
 *
 * Navy background with teal wave top and orange accent for visual continuity
 * with the overall brand palette.
 *
 * Server component — no client state.
 *
 * @module components/sections/CTABanner
 */

import Link from "next/link";
import Button, { ArrowIcon } from "@/components/ui/Button";

export default function CTABanner() {
  return (
    <section
      style={{ backgroundColor: "var(--yah-navy)" }}
      aria-labelledby="cta-heading"
    >
      {/* Wave top */}
      <div style={{ lineHeight: 0, marginBottom: "-1px" }} aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 md:h-14"
          style={{ display: "block", fill: "var(--yah-navy)" }}
        >
          <rect width="1440" height="60" fill="var(--yah-off-white)" />
          <path d="M0,0 C360,60 1080,0 1440,40 L1440,60 L0,60 Z" fill="var(--yah-navy)" />
        </svg>
      </div>

      <div className="container-yah py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Youth CTA ──────────────────────────────────────── */}
          <div
            className="flex flex-col gap-5 p-8 rounded-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "var(--yah-orange)" }}
              aria-hidden="true"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>

            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}
              >
                For Youth
              </p>
              <h2
                id="cta-heading"
                className="font-bold mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--yah-white)",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                }}
              >
                Your Journey Starts Here
              </h2>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Connect with mentors, explore opportunities, and take the next
                step in your education, career, or personal development journey.
              </p>
            </div>

            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                trailingIcon={<ArrowIcon />}
              >
                Get Connected Today
              </Button>
            </Link>
          </div>

          {/* ── Right: Partner / Mentor CTA ──────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Become a Mentor */}
            <div
              className="flex items-start gap-4 p-5 rounded-xl transition-colors duration-200"
              style={{
                backgroundColor: "rgba(43,174,142,0.08)",
                border: "1px solid rgba(43,174,142,0.2)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "rgba(43,174,142,0.15)", color: "var(--yah-teal)" }}
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3
                  className="font-bold mb-1"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)", fontSize: "1rem" }}
                >
                  Become a Mentor
                </h3>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Share your expertise and guide the next generation of professionals.
                </p>
                <Link
                  href="/contact?ref=mentor"
                  className="text-sm font-semibold flex items-center gap-1 hover:underline underline-offset-4"
                  style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}
                >
                  Apply to mentor <ArrowIcon size={13} />
                </Link>
              </div>
            </div>

            {/* Partner With Us */}
            <div
              className="flex items-start gap-4 p-5 rounded-xl"
              style={{
                backgroundColor: "rgba(74,159,212,0.08)",
                border: "1px solid rgba(74,159,212,0.2)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "rgba(74,159,212,0.15)", color: "var(--yah-sky)" }}
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 11l-4.35 4.35M19 7l-4 4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3
                  className="font-bold mb-1"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)", fontSize: "1rem" }}
                >
                  Partner With Us
                </h3>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Organisations — join our network to connect your services to youth who need them.
                </p>
                <Link
                  href="/contact?ref=partner"
                  className="text-sm font-semibold flex items-center gap-1 hover:underline underline-offset-4"
                  style={{ color: "var(--yah-sky)", fontFamily: "var(--font-heading)" }}
                >
                  Become a partner <ArrowIcon size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
