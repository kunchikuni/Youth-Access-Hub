/**
 * Program Detail Page â€” /programs/[slug]
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
                        <p className="text-xs mb-2" style={{ color: "var(--yah-teal)" }}>{mentor.title} Â· {mentor.organisation}</p>
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
