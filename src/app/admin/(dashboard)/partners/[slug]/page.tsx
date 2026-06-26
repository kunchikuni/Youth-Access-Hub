/**
 * Edit Partner Page
 * Route: /admin/partners/[slug]
 *
 * Server Component - fetches the existing partner from Supabase
 * and renders PartnerForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" - that route is handled by
 * /admin/partners/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/partners/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PartnerForm from "@/components/admin/PartnerForm";
import type { Partner } from "@/types/partner";

export const metadata = { title: "Edit Partner - YAH Admin" };

interface EditPartnerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { slug } = await params;

  if (slug === "new") {
    redirect("/admin/partners/new");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  // Map DB row (snake_case) -> Partner type (camelCase) for the form
  const partner: Partner = {
    slug:         data.slug,
    name:         data.name,
    description:  data.description,
    type:         data.type,
    contribution: data.contribution,
    featured:     data.featured,
    ...(data.logo    && { logo:    data.logo }),
    ...(data.website && { website: data.website }),
  };

  return (
    <div className="pne-root">
      <div className="pne-header">
        <h2 className="pne-title">Edit partner</h2>
        <p className="pne-sub">
          Editing: <strong>{partner.name}</strong>
        </p>
      </div>

      <PartnerForm partner={partner} />

      <style>{`
        .pne-root { display:flex; flex-direction:column; gap:1.5rem; }
        .pne-header { max-width:780px; }
        .pne-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .pne-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
        .pne-sub strong { color:var(--yah-navy); font-weight:600; }
      `}</style>
    </div>
  );
}
