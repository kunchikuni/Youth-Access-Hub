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
                      <span>📍 {opp.location}</span>
                      <span>🏢 {opp.provider}</span>
                      {opp.deadline && <span>⏰ Deadline: {formatDate(opp.deadline, { day: "numeric", month: "short" })}</span>}
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
