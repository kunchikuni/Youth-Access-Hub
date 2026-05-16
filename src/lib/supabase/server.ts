/**
 * Supabase server-side client
 * Use in: Server Components, Route Handlers, Server Actions
 *
 * @module lib/supabase/server
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // cookies() may return undefined during static generation (no live request).
  // Guard with try/catch so data fetches still work at build time.
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Static rendering context — no request cookies available
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll() ?? [];
        },
        setAll(cookiesToSet) {
          if (!cookieStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore!.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — middleware will persist the session
          }
        },
      },
    }
  );
}
