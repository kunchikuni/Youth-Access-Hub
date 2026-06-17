/**
 * Revalidation helper
 *
 * Called from client components (admin forms) after a successful
 * create, update, or delete. Posts to /api/revalidate so Next.js
 * regenerates the affected public static pages immediately.
 *
 * @module lib/revalidate
 */

/**
 * Triggers on-demand ISR revalidation for the given paths.
 * Silently no-ops if the request fails — the page will still
 * update on the next scheduled revalidation or redeploy.
 *
 * @param paths - Array of Next.js route paths to revalidate
 */
export async function revalidatePublicPages(paths: string[]): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? "",
      },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Non-fatal — public pages will revalidate on next deploy if this fails
    console.warn("[revalidate] Failed to revalidate paths:", paths);
  }
}

// ─── Path constants ───────────────────────────────────────────────────────────
// Centralised here so we never typo a path in a form component.

export const PROGRAM_PATHS = {
  /** All programs listing */
  list: "/programs",
  /** Individual program detail — pass the slug */
  detail: (slug: string) => `/programs/${slug}`,
  /** Homepage — features programs in ProgramsGrid section */
  home: "/",
} as const;

export const OPPORTUNITY_PATHS = {
  /** All opportunities listing */
  list: "/opportunities",
  /** Individual opportunity detail — pass the slug */
  detail: (slug: string) => `/opportunities/${slug}`,
  /** Homepage — features opportunities in OpportunitiesGrid section */
  home: "/",
} as const;
