/**
 * Edit Opportunity Page
 * Route: /admin/opportunities/[slug]
 *
 * Server Component â€” fetches the existing opportunity from Supabase
 * and renders OpportunityForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" â€” that route is handled by
 * /admin/opportunities/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/opportunities/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OpportunityForm from "@/components/admin/OpportunityForm";
import type { Opportunity } from "@/types/opportunity";

export const metadata = { title: "Edit Opportunity â€” YAH Admin" };

interface EditOpportunityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const { slug } = await params;

  // Guard: if Next.js routes "new" here instead of new/page.tsx, redirect correctly
  if (slug === "new") {
    redirect("/admin/opportunities/new");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  // Map DB row (snake_case) -> Opportunity type (camelCase) for the form
  const opportunity: Opportunity = {
    slug:        data.slug,
    title:       data.title,
    tagline:     data.tagline,
    description: data.description,
    category:    data.category,
    status:      data.status,
    provider:    data.provider,
    location:    data.location,
    audience:    data.audience,
    eligibility: data.eligibility ?? [],
    howToApply:  data.how_to_apply,
    featured:    data.featured,
    ...(data.deadline  && { deadline: data.deadline }),
    ...(data.apply_url && { applyUrl: data.apply_url }),
  };

  return (
    <div className="eo-root">
      <div className="eo-header">
        <h2 className="eo-title">Edit opportunity</h2>
        <p className="eo-sub">
          Editing: <strong>{opportunity.title}</strong>
        </p>
      </div>

      <OpportunityForm opportunity={opportunity} />

      <style>{`
        .eo-root { display:flex; flex-direction:column; gap:1.5rem; }
        .eo-header { max-width:780px; }
        .eo-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .eo-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
        .eo-sub strong { color:var(--yah-navy); font-weight:600; }
      `}</style>
    </div>
  );
}
