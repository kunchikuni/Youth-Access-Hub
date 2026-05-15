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
                      <span>⏱ {program.duration}</span><span>🎓 {program.audience.split(" ").slice(0, 4).join(" ")}</span>
                    </div>
                  </CardBody>
                  <CardFooter bordered className="flex items-center justify-between" style={program.featured ? { borderTopColor: "rgba(255,255,255,0.12)" } : undefined}>
                    <span className="text-xs font-semibold" style={{ color: program.featured ? "var(--yah-orange)" : "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>{program.mentors.length} mentor{program.mentors.length !== 1 ? "s" : ""}</span>
                    <span className="text-xs font-semibold" style={{ color: program.featured ? "rgba(255,255,255,0.6)" : "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>View Program →</span>
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
