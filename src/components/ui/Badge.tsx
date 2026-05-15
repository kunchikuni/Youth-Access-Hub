/**
 * Badge Component
 *
 * Small label used to communicate status, category, or metadata at a glance.
 *
 * Variants:
 *  - status   → open (teal), closed (slate), coming-soon (orange)
 *  - category → programs, opportunities, partner types
 *  - custom   → pass any colour via `color` prop
 *
 * Used on: Program cards, Opportunity cards, Partner cards
 *
 * @module components/ui/Badge
 */

import { cn } from "@/lib/utils";
import type { ProgramStatus, ProgramCategory } from "@/types/program";
import type { OpportunityStatus, OpportunityCategory } from "@/types/opportunity";
import type { PartnerType } from "@/types/partner";

// ─── Types ─────────────────────────────────────────────────────────────────

type BadgeColor =
  | "teal"
  | "orange"
  | "navy"
  | "sky"
  | "slate"
  | "green"
  | "red";

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  /** Adds a filled dot before the label — useful for status badges */
  dot?: boolean;
  className?: string;
}

// ─── Color Map ─────────────────────────────────────────────────────────────

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  teal: {
    backgroundColor: "rgba(43,174,142,0.12)",
    color: "#1A8A72",
    border: "1px solid rgba(43,174,142,0.25)",
  },
  orange: {
    backgroundColor: "rgba(245,166,35,0.12)",
    color: "#B87A0A",
    border: "1px solid rgba(245,166,35,0.3)",
  },
  navy: {
    backgroundColor: "rgba(27,47,107,0.08)",
    color: "var(--yah-navy)",
    border: "1px solid rgba(27,47,107,0.2)",
  },
  sky: {
    backgroundColor: "rgba(74,159,212,0.12)",
    color: "#2A7AAE",
    border: "1px solid rgba(74,159,212,0.25)",
  },
  slate: {
    backgroundColor: "rgba(100,116,139,0.1)",
    color: "#475569",
    border: "1px solid rgba(100,116,139,0.2)",
  },
  green: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#166534",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  red: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#991B1B",
    border: "1px solid rgba(239,68,68,0.2)",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function Badge({
  label,
  color = "navy",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        className
      )}
      style={{
        fontFamily: "var(--font-heading)",
        letterSpacing: "0.02em",
        ...colorStyles[color],
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "currentColor" }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

// ─── Helpers: derive badge props from domain types ─────────────────────────

/**
 * Returns Badge props for a program/opportunity status.
 *
 * @example
 * <Badge {...statusBadge("open")} dot />
 */
export function statusBadge(
  status: ProgramStatus | OpportunityStatus
): Pick<BadgeProps, "label" | "color"> {
  const map: Record<string, Pick<BadgeProps, "label" | "color">> = {
    open: { label: "Open", color: "teal" },
    closed: { label: "Closed", color: "slate" },
    "coming-soon": { label: "Coming Soon", color: "orange" },
  };
  return map[status] ?? { label: status, color: "slate" };
}

/**
 * Returns Badge props for a program category.
 *
 * @example
 * <Badge {...categoryBadge("mentorship")} />
 */
export function categoryBadge(
  category: ProgramCategory | OpportunityCategory | PartnerType
): Pick<BadgeProps, "label" | "color"> {
  const map: Record<string, Pick<BadgeProps, "label" | "color">> = {
    // Program categories
    mentorship: { label: "Mentorship", color: "navy" },
    skills: { label: "Skills", color: "sky" },
    leadership: { label: "Leadership", color: "teal" },
    entrepreneurship: { label: "Entrepreneurship", color: "orange" },
    career: { label: "Career", color: "navy" },
    // Opportunity categories
    internship: { label: "Internship", color: "sky" },
    employment: { label: "Employment", color: "teal" },
    funding: { label: "Funding", color: "orange" },
    training: { label: "Training", color: "navy" },
    volunteering: { label: "Volunteering", color: "green" },
    scholarship: { label: "Scholarship", color: "teal" },
    // Partner types
    school: { label: "School", color: "sky" },
    university: { label: "University", color: "navy" },
    ngo: { label: "NGO", color: "green" },
    corporate: { label: "Corporate", color: "orange" },
    government: { label: "Government", color: "navy" },
    community: { label: "Community", color: "teal" },
  };
  return map[category] ?? { label: category, color: "slate" };
}
