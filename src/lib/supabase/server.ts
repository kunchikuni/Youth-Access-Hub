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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0RG9tYWluIjoicGxhY2Vob2xkZXItdXJsLnN1cGFiYXNlLmNvIn0.placeholder";

  return createServerClient(
    url,
    key,
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
