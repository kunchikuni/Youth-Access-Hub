/**
 * Card Component
 *
 * The primary content container used in grids across the site.
 * Composed by ProgramsGrid, OpportunitiesGrid, and PartnersGrid sections.
 *
 * Variants:
 *  - default  → White card, subtle border, hover lift effect
 *  - featured → Navy background, white text (for hero/highlight cards)
 *  - flat     → No border or shadow (for use on coloured section backgrounds)
 *
 * The Card is intentionally minimal and layout-agnostic.
 * Specific card compositions (ProgramCard, OpportunityCard) are built
 * by composing Card + Badge + Button in the section components.
 *
 * @module components/ui/Card
 */

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type CardVariant = "default" | "featured" | "flat";

interface CardProps {
  variant?: CardVariant;
  /** Adds interactive hover/focus styles — use when card is clickable */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// ─── Style Maps ────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--yah-white)",
    border: "1px solid var(--yah-light-gray)",
    boxShadow: "var(--shadow-card)",
  },
  featured: {
    backgroundColor: "var(--yah-navy)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "var(--shadow-card)",
  },
  flat: {
    backgroundColor: "var(--yah-white)",
    border: "none",
    boxShadow: "none",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function Card({
  variant = "default",
  interactive = false,
  className,
  style,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] overflow-hidden",
        "transition-all duration-250",
        interactive && "cursor-pointer",
        interactive &&
          variant === "default" &&
          "hover:shadow-[var(--shadow-hover)] hover:-translate-y-1",
        interactive &&
          variant === "featured" &&
          "hover:shadow-[0_12px_40px_rgba(27,47,107,0.35)] hover:-translate-y-1",
        className
      )}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Card Sub-components ───────────────────────────────────────────────────

/**
 * CardHeader — top section, typically contains badge(s) and an icon/image.
 */
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>{children}</div>
  );
}

/**
 * CardBody — main content area: title, description, metadata.
 */
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 pb-4 flex-1", className)}>{children}</div>
  );
}

/**
 * CardFooter — bottom section, typically contains action buttons or links.
 * Rendered with a top border separator by default.
 */
export function CardFooter({
  children,
  className,
  bordered = true,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("px-6 pb-6 pt-4", className)}
      style={{
        ...(bordered ? { borderTop: "1px solid var(--yah-light-gray)" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * CardIcon — coloured icon container shown at the top of a card.
 * Accepts a colour from the YAH palette.
 */
export function CardIcon({
  color = "teal",
  children,
}: {
  color?: "teal" | "orange" | "navy" | "sky";
  children: React.ReactNode;
}) {
  const colorMap: Record<string, React.CSSProperties> = {
    teal: {
      backgroundColor: "rgba(43,174,142,0.12)",
      color: "var(--yah-teal)",
    },
    orange: {
      backgroundColor: "rgba(245,166,35,0.12)",
      color: "var(--yah-orange)",
    },
    navy: {
      backgroundColor: "rgba(27,47,107,0.08)",
      color: "var(--yah-navy)",
    },
    sky: {
      backgroundColor: "rgba(74,159,212,0.12)",
      color: "var(--yah-sky)",
    },
  };

  return (
    <div
      className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-4"
      style={colorMap[color]}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
