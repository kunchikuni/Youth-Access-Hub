# ============================================================
# Fix script: writes the correct content directly into both
# admin edit pages, bypassing manual download/rename/move steps
# that have been causing file mix-ups on Windows.
#
# Run this from your project ROOT (where package.json lives):
#   .\fix-admin-edit-pages.ps1
# ============================================================

$programsContent = @'
/**
 * Edit Program Page
 * Route: /admin/programs/[slug]
 *
 * Server Component — fetches the existing program from Supabase
 * and renders ProgramForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" — that route is handled by
 * /admin/programs/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/programs/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgramForm from "@/components/admin/ProgramForm";
import type { Program } from "@/types/program";

export const metadata = { title: "Edit Program — YAH Admin" };

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
'@

$opportunitiesContent = @'
/**
 * Edit Opportunity Page
 * Route: /admin/opportunities/[slug]
 *
 * Server Component — fetches the existing opportunity from Supabase
 * and renders OpportunityForm in edit mode (prefilled).
 *
 * Guards against the slug being "new" — that route is handled by
 * /admin/opportunities/new/page.tsx but Next.js may still route here
 * if there is any ambiguity.
 *
 * @module app/admin/(dashboard)/opportunities/[slug]/page
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OpportunityForm from "@/components/admin/OpportunityForm";
import type { Opportunity } from "@/types/opportunity";

export const metadata = { title: "Edit Opportunity — YAH Admin" };

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
'@

$programsPath = "src\app\admin\(dashboard)\programs\[slug]\page.tsx"
$opportunitiesPath = "src\app\admin\(dashboard)\opportunities\[slug]\page.tsx"

# Ensure parent folders exist (in case they were removed during troubleshooting)
New-Item -ItemType Directory -Force -Path "src\app\admin\(dashboard)\programs\[slug]" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\admin\(dashboard)\opportunities\[slug]" | Out-Null

Set-Content -LiteralPath $programsPath -Value $programsContent -Encoding UTF8
Write-Host "Written: $programsPath" -ForegroundColor Green

Set-Content -LiteralPath $opportunitiesPath -Value $opportunitiesContent -Encoding UTF8
Write-Host "Written: $opportunitiesPath" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying contents..." -ForegroundColor Cyan

$progCheck = Get-Content -LiteralPath $programsPath | Select-String "EditProgramPage"
$oppCheck  = Get-Content -LiteralPath $opportunitiesPath | Select-String "EditOpportunityPage"

if ($progCheck) {
    Write-Host "OK: programs/[slug]/page.tsx contains EditProgramPage" -ForegroundColor Green
} else {
    Write-Host "PROBLEM: programs/[slug]/page.tsx does NOT contain EditProgramPage" -ForegroundColor Red
}

if ($oppCheck) {
    Write-Host "OK: opportunities/[slug]/page.tsx contains EditOpportunityPage" -ForegroundColor Green
} else {
    Write-Host "PROBLEM: opportunities/[slug]/page.tsx does NOT contain EditOpportunityPage" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next"
Write-Host "  npm run dev"
