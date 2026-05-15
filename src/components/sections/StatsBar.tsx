/**
 * StatsBar Section
 *
 * A horizontal band of key impact metrics shown just below the Hero.
 * Communicates YAH's reach and credibility at a glance.
 *
 * Renders on an off-white background to create visual separation
 * between the Hero (navy) and the next content section.
 *
 * Server component — static data, no client state needed.
 *
 * @module components/sections/StatsBar
 */

// ─── Stats Config ──────────────────────────────────────────────────────────

const STATS = [
  {
    value: "500+",
    label: "Youth Connected",
    color: "var(--yah-navy)",
    accent: "var(--yah-orange)",
  },
  {
    value: "3",
    label: "Mentorship Programs",
    color: "var(--yah-navy)",
    accent: "var(--yah-teal)",
  },
  {
    value: "6+",
    label: "Partner Organisations",
    color: "var(--yah-navy)",
    accent: "var(--yah-sky)",
  },
  {
    value: "4",
    label: "Active Opportunities",
    color: "var(--yah-navy)",
    accent: "var(--yah-orange)",
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────

export default function StatsBar() {
  return (
    <section
      style={{ backgroundColor: "var(--yah-off-white)" }}
      aria-label="Organisation impact statistics"
    >
      <div className="container-yah py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map(({ value, label, accent }, index) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-1 relative"
            >
              {/* Vertical divider — between items, not after last */}
              {index < STATS.length - 1 && (
                <div
                  className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px"
                  style={{ backgroundColor: "var(--yah-light-gray)" }}
                  aria-hidden="true"
                />
              )}

              {/* Value */}
              <span
                className="font-bold leading-none"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: accent,
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                }}
              >
                {value}
              </span>

              {/* Label */}
              <span
                className="text-sm font-medium leading-tight"
                style={{
                  color: "var(--yah-slate)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
