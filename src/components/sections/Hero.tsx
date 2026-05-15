/**
 * Hero Section
 *
 * The first thing every visitor sees — must communicate who YAH is,
 * what they do, and what action to take within 3 seconds.
 *
 * Structure:
 *  - Navy background with subtle radial gradient
 *  - Left column: eyebrow tag, headline, subtitle, dual CTAs
 *  - Right column: animated icon composition (door + figure motif)
 *  - Bottom wave transition into the next section
 *
 * Server component — no client state needed.
 *
 * @module components/sections/Hero
 */

import Link from "next/link";
import Button, { ArrowIcon } from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--yah-navy)" }}
      aria-labelledby="hero-heading"
    >
      {/* ── Background radial glow ───────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(43,174,142,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(245,166,35,0.08) 0%, transparent 60%)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="container-yah relative z-10 py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Text ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 max-w-xl">

            {/* Eyebrow tag */}
            <div
              className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: "rgba(245,166,35,0.15)",
                color: "var(--yah-orange)",
                border: "1px solid rgba(245,166,35,0.3)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--yah-orange)" }}
                aria-hidden="true"
              />
              Zimbabwe · Youth · Opportunity
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="font-bold leading-tight"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--yah-white)",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              }}
            >
              Empowering Youth,{" "}
              <span style={{ color: "var(--yah-orange)" }}>Opening</span>{" "}
              <span style={{ color: "var(--yah-teal)" }}>Opportunities</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.75)",
                fontFamily: "var(--font-body)",
              }}
            >
              Youth Access Hub connects young people across Zimbabwe to
              mentorship programs, career opportunities, and a powerful network
              of partner organisations — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/programs">
                <Button
                  variant="primary"
                  size="lg"
                  trailingIcon={<ArrowIcon />}
                >
                  Explore Programs
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button
                  variant="outline"
                  size="lg"
                  style={{
                    borderColor: "rgba(255,255,255,0.35)",
                    color: "var(--yah-white)",
                  }}
                >
                  View Opportunities
                </Button>
              </Link>
            </div>

            {/* Social proof micro-line */}
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Connecting youth to{" "}
              <span style={{ color: "var(--yah-teal)" }}>
                mentors, employers & funders
              </span>{" "}
              across Zimbabwe
            </p>
          </div>

          {/* ── Right: Visual composition ─────────────────────────────── */}
          <div
            className="hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="relative w-80 h-80">

              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  border: "2px dashed var(--yah-teal)",
                  animation: "spin 30s linear infinite",
                }}
              />

              {/* Middle ring */}
              <div
                className="absolute inset-8 rounded-full opacity-15"
                style={{
                  border: "2px dashed var(--yah-orange)",
                  animation: "spin 20s linear infinite reverse",
                }}
              />

              {/* Centre card */}
              <div
                className="absolute inset-16 rounded-3xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Door + figure SVG */}
                {/*<svg*/}
                {/*  width="100"*/}
                {/*  height="100"*/}
                {/*  viewBox="0 0 40 40"*/}
                {/*  fill="none"*/}
                {/*  xmlns="http://www.w3.org/2000/svg"*/}
                {/*>*/}
                {/*  <rect x="4" y="6" width="14" height="28" rx="1" fill="#F5A623" fillOpacity="0.9" />*/}
                {/*  <rect x="22" y="6" width="14" height="28" rx="1" fill="#2BAE8E" fillOpacity="0.9" />*/}
                {/*  <circle cx="20" cy="13" r="3.5" fill="#4A9FD4" />*/}
                {/*  <path*/}
                {/*    d="M16.5 20.5 C16.5 20.5 18 18 20 18 C22 18 23.5 20.5 23.5 20.5 L25.5 27 M20 18 L17.5 27"*/}
                {/*    stroke="#4A9FD4"*/}
                {/*    strokeWidth="2.2"*/}
                {/*    strokeLinecap="round"*/}
                {/*    strokeLinejoin="round"*/}
                {/*  />*/}
                    <img
                        src="/images/yah_logo.png"
                        alt="Youth Access Hub Logo"
                        width={100}
                        height={100}
                        className="flex-shrink-0 object-contain"
                    />
                {/*</svg>*/}
              </div>

              {/* Floating chips */}
              <FloatingChip
                label="Mentorship"
                color="var(--yah-orange)"
                style={{ top: "10%", left: "-8%" }}
                delay="0s"
              />
              <FloatingChip
                label="Opportunities"
                color="var(--yah-teal)"
                style={{ bottom: "12%", right: "-10%" }}
                delay="1s"
              />
              <FloatingChip
                label="Partners"
                color="var(--yah-sky)"
                style={{ top: "55%", left: "-12%" }}
                delay="2s"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom wave transition ───────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{ lineHeight: 0, marginTop: "-1px" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-16 lg:h-20"
          style={{ display: "block", fill: "var(--yah-off-white)" }}
        >
          <path d="M0,80 C480,20 960,60 1440,30 L1440,80 Z" />
        </svg>
      </div>

      {/* ── Keyframe for spinning rings ──────────────────────────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}

// ─── Floating Chip Helper ──────────────────────────────────────────────────

function FloatingChip({
  label,
  color,
  style,
  delay,
}: {
  label: string;
  color: string;
  style: React.CSSProperties;
  delay: string;
}) {
  return (
    <div
      className="absolute px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
      style={{
        ...style,
        backgroundColor: "rgba(255,255,255,0.08)",
        border: `1px solid ${color}40`,
        color,
        fontFamily: "var(--font-heading)",
        animation: `float 4s ease-in-out ${delay} infinite`,
        backdropFilter: "blur(4px)",
      }}
    >
      {label}
    </div>
  );
}
