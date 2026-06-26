# ============================================================
# Heroicons migration script (Windows PowerShell 5.1 safe)
#
# Replaces emoji (location pin, building, clock, etc.) with
# inline SVG Heroicons across the 4 public-facing pages, and
# adds the new shared MetaIcons.tsx component file.
#
# Uses [System.IO.File]::WriteAllText() with explicit UTF8
# (no BOM) encoding - safe for PowerShell 5.1, though these
# files no longer contain any multi-byte characters anyway.
#
# Run this from your project ROOT (where package.json lives):
#   .\add-heroicons.ps1
# ============================================================

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$metaIconsContent = @'
/**
 * Meta Icons
 * Small inline SVG icons (Heroicons outline, 24x24) used to replace
 * emoji in program/opportunity metadata rows — location, provider,
 * deadline, duration, audience, start date, partner.
 *
 * Source: Heroicons (MIT licence) — https://heroicons.com
 * Inlined directly rather than via package import to match the
 * existing pattern used by ProgramIcon / OpportunityIcon in this codebase.
 *
 * @module components/ui/MetaIcons
 */

interface IconProps {
  size?: number;
}

/** Map pin — used for location */
export function LocationIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21c-4.5-4.5-7-8.014-7-11a7 7 0 1114 0c0 2.986-2.5 6.5-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** Building — used for provider / organisation / partner */
export function BuildingIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h1M9 13h1M14 9h1M14 13h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

/** Clock — used for duration / deadline countdown */
export function ClockIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

/** Calendar — used for deadline date / start date */
export function CalendarIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

/** Academic cap — used for audience / target group */
export function AudienceIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M7 9.5V15c0 1.5 2.5 3 5 3s5-1.5 5-3V9.5" />
      <path d="M21 7.5v5" />
    </svg>
  );
}

/** Handshake-ish (two linked circles) — used for partner organisation */
export function PartnerIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M3 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M11 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  );
}

/** People / group — used for mentor count */
export function PeopleIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

'@

$programsListContent = @'
/**
 * Programs Page — /programs
 * @module app/programs/page
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getPrograms } from "@/lib/getData";
import type { Program } from "@/types/program";
import SectionHeading from "@/components/ui/SectionHeading";
import Card, { CardHeader, CardBody, CardFooter, CardIcon } from "@/components/ui/Card";
import Badge, { statusBadge, categoryBadge } from "@/components/ui/Badge";
import CTABanner from "@/components/sections/CTABanner";
import { ClockIcon, AudienceIcon } from "@/components/ui/MetaIcons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mentorship Programs",
  description: "Explore Youth Access Hub's mentorship programs connecting young people with experienced professionals across Zimbabwe.",
};

function ProgramIcon({ category }: { category: Program["category"] }) {
  const icons: Record<Program["category"], React.ReactNode> = {
    mentorship: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>),
    leadership: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
    entrepreneurship: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>),
    skills: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>),
    career: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>),
  };
  return <>{icons[category] ?? icons.mentorship}</>;
}

const iconColors: Record<Program["category"], "teal" | "orange" | "sky" | "navy"> = {
  mentorship: "teal", leadership: "orange", entrepreneurship: "orange", skills: "sky", career: "navy",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <>
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading eyebrow="What We Offer" title="Mentorship Programs"
            subtitle="Structured programs pairing young people with experienced professionals. Each program has clear outcomes, defined timelines, and dedicated mentors from our partner network."
            color="light" decorativeBar accent="orange" />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-off-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-12 md:py-16">
          <p className="text-sm mb-8" style={{ color: "var(--yah-slate)" }}>Showing <strong>{programs.length}</strong> program{programs.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link key={program.slug} href={`/programs/${program.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yah-orange)] rounded-[var(--radius-lg)]" aria-label={`View ${program.title}`}>
                <Card variant={program.featured ? "featured" : "default"} interactive className="h-full flex flex-col">
                  <CardHeader>
                    <CardIcon color={iconColors[program.category]}><ProgramIcon category={program.category} /></CardIcon>
                    <div className="flex flex-wrap gap-2"><Badge {...categoryBadge(program.category)} /><Badge {...statusBadge(program.status)} dot /></div>
                  </CardHeader>
                  <CardBody className="flex-1">
                    <h2 className="font-bold text-lg mb-2 leading-snug" style={{ fontFamily: "var(--font-heading)", color: program.featured ? "var(--yah-white)" : "var(--yah-navy)" }}>{program.title}</h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: program.featured ? "rgba(255,255,255,0.72)" : "var(--yah-slate)" }}>{program.tagline}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: program.featured ? "rgba(255,255,255,0.5)" : "var(--yah-slate)" }}>
                      <span className="inline-flex items-center gap-1"><ClockIcon size={14} /> {program.duration}</span>
                      <span className="inline-flex items-center gap-1"><AudienceIcon size={14} /> {program.audience.split(" ").slice(0, 3).join(" ")}</span>
                    </div>
                  </CardBody>
                  <CardFooter bordered className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: program.featured ? "rgba(255,255,255,0.6)" : "var(--yah-slate)", fontFamily: "var(--font-heading)" }}>{program.category}</span>
                    <span className="text-xs font-semibold" style={{ color: program.featured ? "var(--yah-orange)" : "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>View Details →</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

'@

$programsDetailContent = @'
/**
 * Program Detail Page — /programs/[slug]
 * @module app/programs/[slug]/page
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProgramBySlug, getProgramSlugs } from "@/lib/getData";
import { formatDate } from "@/lib/utils";
import Badge, { statusBadge, categoryBadge } from "@/components/ui/Badge";
import Button, { ArrowIcon } from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import { ClockIcon, AudienceIcon, CalendarIcon, PartnerIcon, PeopleIcon } from "@/components/ui/MetaIcons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getProgramSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program Not Found" };
  return { title: program.title, description: program.tagline };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  return (
    <>
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-14 md:py-20">
          <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
            <Link href="/programs" className="hover:underline underline-offset-4" style={{ color: "rgba(255,255,255,0.55)" }}>Programs</Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "var(--yah-orange)" }}>{program.title}</span>
          </nav>
          <div className="flex flex-wrap gap-3 mb-5">
            <Badge {...categoryBadge(program.category)} />
            <Badge {...statusBadge(program.status)} dot />
          </div>
          <h1 className="font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.2 }}>
            {program.title}
          </h1>
          <p className="text-lg mb-8 max-w-2xl" style={{ color: "rgba(255,255,255,0.75)" }}>{program.tagline}</p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <ClockIcon size={14} />, label: program.duration },
              { icon: <AudienceIcon size={14} />, label: program.audience },
              ...(program.startDate ? [{ icon: <CalendarIcon size={14} />, label: `Starts ${formatDate(program.startDate)}` }] : []),
              ...(program.partner ? [{ icon: <PartnerIcon size={14} />, label: program.partner }] : []),
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span aria-hidden="true" className="flex items-center">{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex flex-col gap-10">
              <div>
                <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>About This Program</h2>
                <p className="leading-relaxed" style={{ color: "var(--yah-slate)" }}>{program.description}</p>
              </div>
              <div>
                <h2 className="font-bold text-xl mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>What You Will Gain</h2>
                <ul className="flex flex-col gap-3" role="list">
                  {program.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(43,174,142,0.15)", color: "var(--yah-teal)" }} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: "var(--yah-slate)" }}>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-bold text-xl mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Your Mentor{program.mentors.length !== 1 ? "s" : ""}</h2>
                <div className="flex flex-col gap-4">
                  {program.mentors.map((mentor) => (
                    <div key={mentor.name} className="flex items-start gap-4 p-5 rounded-xl"
                      style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)" }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        style={{ backgroundColor: "rgba(27,47,107,0.1)", color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>{mentor.name}</p>
                        <p className="text-xs mb-2" style={{ color: "var(--yah-teal)" }}>{mentor.title} · {mentor.organisation}</p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--yah-slate)" }}>{mentor.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl flex flex-col gap-5" style={{ backgroundColor: "var(--yah-navy)" }}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}>Status</p>
                  <Badge {...statusBadge(program.status)} dot />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}>Quick Details</p>
                  <ul className="flex flex-col gap-2 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                    <li className="flex items-center gap-2"><ClockIcon size={14} /> Duration: {program.duration}</li>
                    <li className="flex items-center gap-2"><AudienceIcon size={14} /> For: {program.audience}</li>
                    {program.startDate && <li className="flex items-center gap-2"><CalendarIcon size={14} /> Starts: {formatDate(program.startDate)}</li>}
                    <li className="flex items-center gap-2"><PeopleIcon size={14} /> Mentors: {program.mentors.length}</li>
                  </ul>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                  <Link href={`/contact?ref=program&program=${program.slug}`}>
                    <Button variant="primary" size="md" fullWidth trailingIcon={<ArrowIcon />}>
                      {program.status === "open" ? "Apply Now" : "Register Interest"}
                    </Button>
                  </Link>
                  <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>Applications coordinated by YAH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

'@

$opportunitiesListContent = @'
/**
 * Opportunities Page — /opportunities
 * @module app/opportunities/page
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getOpportunities } from "@/lib/getData";
import type { Opportunity } from "@/types/opportunity";
import SectionHeading from "@/components/ui/SectionHeading";
import Card, { CardHeader, CardBody, CardFooter, CardIcon } from "@/components/ui/Card";
import Badge, { statusBadge, categoryBadge } from "@/components/ui/Badge";
import CTABanner from "@/components/sections/CTABanner";
import { formatDate } from "@/lib/utils";
import { LocationIcon, BuildingIcon, ClockIcon } from "@/components/ui/MetaIcons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Explore internships, funding, scholarships, training and volunteering opportunities available through Youth Access Hub.",
};

function OpportunityIcon({ category }: { category: Opportunity["category"] }) {
  const icons: Record<Opportunity["category"], React.ReactNode> = {
    internship: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>),
    employment: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>),
    funding: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>),
    training: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>),
    volunteering: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
    scholarship: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>),
  };
  return <>{icons[category] ?? icons.internship}</>;
}

const iconColors: Record<Opportunity["category"], "teal" | "orange" | "sky" | "navy"> = {
  internship: "sky", employment: "teal", funding: "orange", training: "navy", volunteering: "teal", scholarship: "teal",
};

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  return (
    <>
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading eyebrow="Grow With Us" title="Opportunities"
            subtitle="From internships and funding to scholarships and volunteering — discover growth opportunities coordinated through YAH's partner network."
            color="light" decorativeBar accent="teal" />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-off-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-12 md:py-16">
          <p className="text-sm mb-8" style={{ color: "var(--yah-slate)" }}>Showing <strong>{opportunities.length}</strong> opportunit{opportunities.length !== 1 ? "ies" : "y"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <Link key={opp.slug} href={`/opportunities/${opp.slug}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yah-teal)] rounded-[var(--radius-lg)]"
                aria-label={`View ${opp.title}`}>
                <Card interactive className="h-full flex flex-col">
                  <CardHeader>
                    <CardIcon color={iconColors[opp.category]}><OpportunityIcon category={opp.category} /></CardIcon>
                    <div className="flex flex-wrap gap-2"><Badge {...categoryBadge(opp.category)} /><Badge {...statusBadge(opp.status)} dot /></div>
                  </CardHeader>
                  <CardBody className="flex-1">
                    <h2 className="font-bold text-lg mb-2 leading-snug" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>{opp.title}</h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--yah-slate)" }}>{opp.tagline}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--yah-slate)" }}>
                      <span className="inline-flex items-center gap-1"><LocationIcon size={14} /> {opp.location}</span>
                      <span className="inline-flex items-center gap-1"><BuildingIcon size={14} /> {opp.provider}</span>
                      {opp.deadline && <span className="inline-flex items-center gap-1"><ClockIcon size={14} /> Deadline: {formatDate(opp.deadline, { day: "numeric", month: "short" })}</span>}
                    </div>
                  </CardBody>
                  <CardFooter bordered className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: "var(--yah-slate)", fontFamily: "var(--font-heading)" }}>{opp.audience.split(" ").slice(0, 3).join(" ")}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>View Details →</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

'@

$opportunitiesDetailContent = @'
/**
 * Opportunity Detail Page — /opportunities/[slug]
 * @module app/opportunities/[slug]/page
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpportunityBySlug, getOpportunitySlugs } from "@/lib/getData";
import { formatDate } from "@/lib/utils";
import Badge, { statusBadge, categoryBadge } from "@/components/ui/Badge";
import Button, { ArrowIcon } from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import { LocationIcon, BuildingIcon, ClockIcon, AudienceIcon } from "@/components/ui/MetaIcons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getOpportunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp) return { title: "Opportunity Not Found" };
  return { title: opp.title, description: opp.tagline };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp) notFound();

  return (
    <>
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-14 md:py-20">
          <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
            <Link href="/opportunities" className="hover:underline underline-offset-4" style={{ color: "rgba(255,255,255,0.55)" }}>Opportunities</Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "var(--yah-teal)" }}>{opp.title}</span>
          </nav>
          <div className="flex flex-wrap gap-3 mb-5">
            <Badge {...categoryBadge(opp.category)} />
            <Badge {...statusBadge(opp.status)} dot />
          </div>
          <h1 className="font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-white)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.2 }}>{opp.title}</h1>
          <p className="text-lg mb-8 max-w-2xl" style={{ color: "rgba(255,255,255,0.75)" }}>{opp.tagline}</p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <LocationIcon size={14} />, label: opp.location },
              { icon: <BuildingIcon size={14} />, label: opp.provider },
              ...(opp.deadline ? [{ icon: <ClockIcon size={14} />, label: `Deadline: ${formatDate(opp.deadline)}` }] : []),
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span aria-hidden="true" className="flex items-center">{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex flex-col gap-10">
              <div>
                <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>About This Opportunity</h2>
                <p className="leading-relaxed" style={{ color: "var(--yah-slate)" }}>{opp.description}</p>
              </div>
              <div>
                <h2 className="font-bold text-xl mb-5" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Eligibility Requirements</h2>
                <ul className="flex flex-col gap-3" role="list">
                  {opp.eligibility.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(43,174,142,0.15)", color: "var(--yah-teal)" }} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: "var(--yah-slate)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>How to Apply</h2>
                <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--yah-slate)" }}>{opp.howToApply}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl flex flex-col gap-5" style={{ backgroundColor: "var(--yah-navy)" }}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>Status</p>
                  <Badge {...statusBadge(opp.status)} dot />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>Quick Details</p>
                  <ul className="flex flex-col gap-2 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                    <li className="flex items-center gap-2"><LocationIcon size={14} /> {opp.location}</li>
                    <li className="flex items-center gap-2"><BuildingIcon size={14} /> {opp.provider}</li>
                    <li className="flex items-center gap-2"><AudienceIcon size={14} /> {opp.audience}</li>
                    {opp.deadline && <li className="flex items-center gap-2"><ClockIcon size={14} /> Deadline: {formatDate(opp.deadline)}</li>}
                  </ul>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                  <Link href={opp.applyUrl ?? `/contact?ref=opportunity&opp=${opp.slug}`} target={opp.applyUrl ? "_blank" : undefined} rel={opp.applyUrl ? "noopener noreferrer" : undefined}>
                    <Button variant="teal" size="md" fullWidth trailingIcon={<ArrowIcon />}>
                      {opp.status === "open" ? "Apply Now" : "Register Interest"}
                    </Button>
                  </Link>
                  <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>Coordinated by Youth Access Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

'@

# --- Ensure target directories exist ---
New-Item -ItemType Directory -Force -Path "src\components\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\programs" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\programs\[slug]" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\opportunities" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\opportunities\[slug]" | Out-Null

# --- Write files ---
$fullPath_meta_icons = Join-Path (Get-Location) "src\components\ui\MetaIcons.tsx"
[System.IO.File]::WriteAllText($fullPath_meta_icons, $metaIconsContent, $utf8NoBom)
Write-Host "Written: src\components\ui\MetaIcons.tsx" -ForegroundColor Green
$fullPath_programs_list = Join-Path (Get-Location) "src\app\programs\page.tsx"
[System.IO.File]::WriteAllText($fullPath_programs_list, $programsListContent, $utf8NoBom)
Write-Host "Written: src\app\programs\page.tsx" -ForegroundColor Green
$fullPath_programs_detail = Join-Path (Get-Location) "src\app\programs\[slug]\page.tsx"
[System.IO.File]::WriteAllText($fullPath_programs_detail, $programsDetailContent, $utf8NoBom)
Write-Host "Written: src\app\programs\[slug]\page.tsx" -ForegroundColor Green
$fullPath_opportunities_list = Join-Path (Get-Location) "src\app\opportunities\page.tsx"
[System.IO.File]::WriteAllText($fullPath_opportunities_list, $opportunitiesListContent, $utf8NoBom)
Write-Host "Written: src\app\opportunities\page.tsx" -ForegroundColor Green
$fullPath_opportunities_detail = Join-Path (Get-Location) "src\app\opportunities\[slug]\page.tsx"
[System.IO.File]::WriteAllText($fullPath_opportunities_detail, $opportunitiesDetailContent, $utf8NoBom)
Write-Host "Written: src\app\opportunities\[slug]\page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying contents..." -ForegroundColor Cyan
$check_meta_icons = Get-Content -LiteralPath "src\components\ui\MetaIcons.tsx" -Raw
if ($check_meta_icons -match "LocationIcon") { Write-Host "OK: src\components\ui\MetaIcons.tsx contains LocationIcon" -ForegroundColor Green } else { Write-Host "PROBLEM: src\components\ui\MetaIcons.tsx missing expected content" -ForegroundColor Red }
$check_programs_list = Get-Content -LiteralPath "src\app\programs\page.tsx" -Raw
if ($check_programs_list -match "ProgramsPage") { Write-Host "OK: src\app\programs\page.tsx contains ProgramsPage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\programs\page.tsx missing expected content" -ForegroundColor Red }
$check_programs_detail = Get-Content -LiteralPath "src\app\programs\[slug]\page.tsx" -Raw
if ($check_programs_detail -match "ProgramDetailPage") { Write-Host "OK: src\app\programs\[slug]\page.tsx contains ProgramDetailPage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\programs\[slug]\page.tsx missing expected content" -ForegroundColor Red }
$check_opportunities_list = Get-Content -LiteralPath "src\app\opportunities\page.tsx" -Raw
if ($check_opportunities_list -match "OpportunitiesPage") { Write-Host "OK: src\app\opportunities\page.tsx contains OpportunitiesPage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\opportunities\page.tsx missing expected content" -ForegroundColor Red }
$check_opportunities_detail = Get-Content -LiteralPath "src\app\opportunities\[slug]\page.tsx" -Raw
if ($check_opportunities_detail -match "OpportunityDetailPage") { Write-Host "OK: src\app\opportunities\[slug]\page.tsx contains OpportunityDetailPage" -ForegroundColor Green } else { Write-Host "PROBLEM: src\app\opportunities\[slug]\page.tsx missing expected content" -ForegroundColor Red }

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Then check /programs, /opportunities, and their detail pages for icons instead of emoji." -ForegroundColor Cyan
