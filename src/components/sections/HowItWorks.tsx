/**
 * HowItWorks Section
 *
 * Explains YAH's value proposition in three clear steps.
 * Positioned early on the homepage to immediately answer
 * "how does this work?" for first-time visitors.
 *
 * Steps:
 *  1. Register with YAH — get onboarded and profiled
 *  2. Get Matched — to programs, opportunities, mentors
 *  3. Access & Grow — take action and track progress
 *
 * Server component — no client state.
 *
 * @module components/sections/HowItWorks
 */

import SectionHeading from "@/components/ui/SectionHeading";

// ─── Steps Config ──────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Register with YAH",
    description:
      "Sign up at any of our school-anchored or community-based access points. We onboard you, understand your background, and build your profile.",
    color: "var(--yah-orange)",
    bgColor: "rgba(245,166,35,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "Our coordinators map your needs and goals to the right mentors, programs, and opportunities from our network of partner organisations.",
    color: "var(--yah-teal)",
    bgColor: "rgba(43,174,142,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Access & Grow",
    description:
      "Attend sessions, engage mentors, apply for opportunities, and track your progress. YAH supports you every step of the way.",
    color: "var(--yah-sky)",
    bgColor: "rgba(74,159,212,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────

export default function HowItWorks() {
  return (
    <section
      style={{ backgroundColor: "var(--yah-white)" }}
      aria-labelledby="how-it-works-heading"
      id="how-it-works"
    >
      <div className="container-yah py-16 md:py-24">

        {/* Heading */}
        <SectionHeading
          eyebrow="How It Works"
          title="Three Steps to Your Opportunity"
          subtitle="Youth Access Hub simplifies access to a complex ecosystem of support. Here's your path from registration to growth."
          align="center"
          decorativeBar
          accent="teal"
          id="how-it-works-heading"
        />

        {/* Steps grid */}
        <div className="mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative">

          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ backgroundColor: "var(--yah-light-gray)" }}
            aria-hidden="true"
          />

          {STEPS.map(({ number, title, description, color, bgColor, icon }) => (
            <div
              key={number}
              className="flex flex-col items-center text-center gap-4 relative"
            >
              {/* Step icon circle */}
              <div
                className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: bgColor,
                  border: `2px solid ${color}30`,
                  color,
                }}
              >
                {icon}
                {/* Step number badge */}
                <span
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: color,
                    color: "var(--yah-white)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {number.replace("0", "")}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3
                  className="font-bold text-lg"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--yah-navy)",
                  }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--yah-slate)" }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
