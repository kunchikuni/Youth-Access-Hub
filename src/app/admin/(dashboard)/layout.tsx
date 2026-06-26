/**
 * Admin Dashboard Layout
 * Applies to: /admin, /admin/programs/*, /admin/opportunities/*
 * Does NOT apply to: /admin/login (that lives in the (auth) group)
 *
 * - Server Component: reads the Supabase session server-side
 * - Redirects unauthenticated users to /admin/login
 * - Renders the AdminShell (sidebar + topbar) around all dashboard pages
 *
 * @module app/admin/(dashboard)/layout
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

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
