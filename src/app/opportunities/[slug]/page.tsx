/**
 * Opportunity Detail Page â€” /opportunities/[slug]
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
              { icon: "ðŸ“", label: opp.location },
              { icon: "ðŸ¢", label: opp.provider },
              ...(opp.deadline ? [{ icon: "â°", label: `Deadline: ${formatDate(opp.deadline)}` }] : []),
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span aria-hidden="true">{icon}</span> {label}
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
                    <li>ðŸ“ {opp.location}</li>
                    <li>ðŸ¢ {opp.provider}</li>
                    <li>ðŸŽ“ {opp.audience}</li>
                    {opp.deadline && <li>â° Deadline: {formatDate(opp.deadline)}</li>}
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

