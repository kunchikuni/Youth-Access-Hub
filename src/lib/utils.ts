/**
 * Shared utility functions
 * Keep this file lean — only pure, stateless helpers.
 *
 * @module lib/utils
 */

/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx for Tailwind class composition.
 *
 * @example
 * cn("base-class", isActive && "active-class", undefined)
 * // => "base-class active-class"
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats an ISO date string into a human-readable format.
 *
 * @param isoDate - ISO 8601 date string e.g. "2026-06-01"
 * @param options - Intl.DateTimeFormatOptions override
 * @returns Formatted date string e.g. "1 June 2026"
 *
 * @example
 * formatDate("2026-06-01") // => "1 June 2026"
 */
export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    console.warn(`formatDate: Invalid date string received: "${isoDate}"`);
    return isoDate;
  }
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

/**
 * Converts a string into a URL-safe slug.
 *
 * @param text - Raw string to slugify
 * @returns Lowercase, hyphenated slug
 *
 * @example
 * slugify("Career Mentorship Program") // => "career-mentorship-program"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalises the first letter of a string.
 *
 * @example
 * capitalise("mentorship") // => "Mentorship"
 */
export function capitalise(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Truncates a string to a given length, appending an ellipsis if truncated.
 *
 * @param text - String to truncate
 * @param maxLength - Maximum character length before truncation
 *
 * @example
 * truncate("A very long description...", 20) // => "A very long descript..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
