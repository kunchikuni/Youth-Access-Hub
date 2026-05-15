/**
 * Supabase browser-side client
 * Use in: Client Components ('use client') only
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
