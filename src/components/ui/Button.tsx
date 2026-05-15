/**
 * Button Component
 *
 * The primary interactive element across the YAH site.
 *
 * Variants:
 *  - primary   → Orange fill, navy text (main CTAs)
 *  - secondary → Navy fill, white text (secondary actions)
 *  - outline   → Navy border + text, transparent fill (tertiary actions)
 *  - ghost     → No border or fill, teal text (inline/subtle actions)
 *  - teal      → Teal fill, white text (success/growth actions)
 *
 * Sizes:
 *  - sm  → Compact, for inline use
 *  - md  → Default
 *  - lg  → Hero / section CTAs
 *
 * Supports:
 *  - Leading and trailing icons
 *  - Loading state with spinner
 *  - Full-width mode
 *  - Renders as <button> or <a> (via `as` prop or wrapping with Next/Link)
 *
 * @module components/ui/Button
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "teal";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after label */
  trailingIcon?: React.ReactNode;
  /** Shows a spinner and disables interaction */
  loading?: boolean;
  /** Expands button to full container width */
  fullWidth?: boolean;
}

// ─── Style Maps ────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--yah-orange)",
    color: "var(--yah-navy)",
    border: "2px solid transparent",
  },
  secondary: {
    backgroundColor: "var(--yah-navy)",
    color: "var(--yah-white)",
    border: "2px solid transparent",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--yah-navy)",
    border: "2px solid var(--yah-navy)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--yah-teal)",
    border: "2px solid transparent",
  },
  teal: {
    backgroundColor: "var(--yah-teal)",
    color: "var(--yah-white)",
    border: "2px solid transparent",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

// ─── Spinner ───────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0110 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-semibold rounded-full",
          "transition-all duration-200 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // Hover/active (when not disabled)
          !isDisabled && "hover:scale-[1.03] hover:shadow-md active:scale-[0.97]",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed",
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        style={{
          ...variantStyles[variant],
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.01em",
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : leadingIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && trailingIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

// ─── Arrow Icon Helper (commonly used trailing icon) ───────────────────────

export function ArrowIcon({
  size = 16,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
