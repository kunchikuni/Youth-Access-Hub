/**
 * Admin Layout
 * Route shell: /admin/*  (excludes /admin/login — that has its own layout)
 *
 * - Server Component: reads the Supabase session server-side
 * - Redirects unauthenticated users to /admin/login
 *   (middleware does this too — this is a belt-and-braces guard)
 * - Renders the sidebar + topbar shell around all admin pages
 *
 * @module app/admin/layout
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: {
    template: "%s — YAH Admin",
    default: "Dashboard — YAH Admin",
  },
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces: middleware already handles this redirect,
  // but we guard here too in case middleware is bypassed.
  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
