/**
 * Supabase browser-side client
 * Use in: Client Components ('use client') only
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0RG9tYWluIjoicGxhY2Vob2xkZXItdXJsLnN1cGFiYXNlLmNvIn0.placeholder";

  return createBrowserClient(
    url,
    key
  );
}
