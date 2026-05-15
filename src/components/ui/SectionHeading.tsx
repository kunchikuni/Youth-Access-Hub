/**
 * SectionHeading Component
 *
 * Standardises heading hierarchy and visual style across all page sections.
 * Ensures consistent spacing, typography, and optional decorative elements
 * site-wide without repeating heading styles in every section component.
 *
 * Anatomy:
 *  [eyebrow label]   ← optional small uppercase label above title
 *  [title]           ← required H2 (or H3 for sub-sections)
 *  [subtitle]        ← optional supporting paragraph
 *  [decorative bar]  ← optional coloured underline accent
 *
 * Alignment variants: left | center
 * Colour variants: dark (navy text, for light backgrounds) | light (white text, for dark backgrounds)
 *
 * @module components/ui/SectionHeading
 */

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type HeadingLevel = "h2" | "h3";
type HeadingAlign = "left" | "center";
type HeadingColor = "dark" | "light";

interface SectionHeadingProps {
  /** Small label displayed above the title — e.g. "Our Programs", "How It Works" */
  eyebrow?: string;
  /** Main section title — required */
  title: string;
  /** Optional subtitle / supporting text */
  subtitle?: string;
  /** Heading level — h2 for page sections, h3 for sub-sections */
  as?: HeadingLevel;
  align?: HeadingAlign;
  /** dark = navy text (use on white/off-white backgrounds) */
  color?: HeadingColor;
  /** Shows a short coloured bar beneath the title */
  decorativeBar?: boolean;
  /** Accent colour for the decorative bar and eyebrow */
  accent?: "orange" | "teal";
  /** Max width constraint for the subtitle on centered layouts */
  subtitleMaxWidth?: string;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: Tag = "h2",
  align = "left",
  color = "dark",
  decorativeBar = false,
  accent = "orange",
  subtitleMaxWidth = "600px",
  className,
}: SectionHeadingProps) {
  const isDark = color === "dark";
  const accentColor =
    accent === "orange" ? "var(--yah-orange)" : "var(--yah-teal)";

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {/* Eyebrow */}
      {eyebrow && (
        <span
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{
            color: accentColor,
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.14em",
          }}
        >
          {eyebrow}
        </span>
      )}

      {/* Title */}
      <Tag
        className="font-bold leading-tight"
        style={{
          fontFamily: "var(--font-heading)",
          color: isDark ? "var(--yah-navy)" : "var(--yah-white)",
          fontSize: Tag === "h2" ? "clamp(1.75rem, 4vw, 2.5rem)" : "clamp(1.375rem, 3vw, 1.875rem)",
        }}
      >
        {title}
      </Tag>

      {/* Decorative bar */}
      {decorativeBar && (
        <div
          className="mt-4 rounded-full"
          style={{
            width: "48px",
            height: "4px",
            backgroundColor: accentColor,
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtitle */}
      {subtitle && (
        <p
          className="mt-4 leading-relaxed text-base md:text-lg"
          style={{
            color: isDark ? "var(--yah-slate)" : "rgba(255,255,255,0.8)",
            maxWidth: align === "center" ? subtitleMaxWidth : undefined,
            fontFamily: "var(--font-body)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
