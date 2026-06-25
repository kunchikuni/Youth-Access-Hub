/**
 * Edit Program Page
 * Route: /admin/programs/[slug]
 *
 * Server Component â€” fetches the existing program from Supabase
 * and renders ProgramForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" â€” that route is handled by
 * /admin/programs/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/programs/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgramForm from "@/components/admin/ProgramForm";
import type { Program } from "@/types/program";

export const metadata = { title: "Edit Program â€” YAH Admin" };

interface EditProgramPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const { slug } = await params;

  // Guard: if Next.js routes "new" here instead of new/page.tsx, redirect correctly
  if (slug === "new") {
    redirect("/admin/programs/new");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  // Map DB row (snake_case) -> Program type (camelCase) for the form
  const program: Program = {
    slug:        data.slug,
    title:       data.title,
    tagline:     data.tagline,
    description: data.description,
    category:    data.category,
    status:      data.status,
    duration:    data.duration,
    audience:    data.audience,
    outcomes:    data.outcomes ?? [],
    mentors:     data.mentors  ?? [],
    featured:    data.featured,
    ...(data.cover_image && { photo:     data.cover_image }),
    ...(data.start_date  && { startDate: data.start_date }),
    ...(data.partner     && { partner:   data.partner }),
  };

  return (
    <div className="ep-root">
      <div className="ep-header">
        <h2 className="ep-title">Edit program</h2>
        <p className="ep-sub">
          Editing: <strong>{program.title}</strong>
        </p>
      </div>

      <ProgramForm program={program} />

      <style>{`
        .ep-root { display:flex; flex-direction:column; gap:1.5rem; }
        .ep-header { max-width:780px; }
        .ep-title { font-family:var(--font-heading); font-size:1.375rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.25rem; }
        .ep-sub { font-size:0.9375rem; color:var(--yah-slate); margin:0; }
        .ep-sub strong { color:var(--yah-navy); font-weight:600; }
      `}</style>
    </div>
  );
}
