/**
 * About Page — /about
 * @module app/about/page
 */
import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button, { ArrowIcon } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Youth Access Hub — our mission, vision, values, and how we connect young people to opportunities across Zimbabwe.",
};

const VALUES = [
  { title: "Youth-Centred", description: "Every decision starts with what young people need. We are guided by their realities, not institutional convenience.", color: "var(--yah-orange)" },
  { title: "Collaborative", description: "We believe in the power of partnership. No single organisation can solve youth unemployment alone — we build bridges.", color: "var(--yah-teal)" },
  { title: "Transparent", description: "We are accountable to the youth we serve, the partners we work with, and the donors who fund our work.", color: "var(--yah-sky)" },
  { title: "Inclusive", description: "We actively reach youth who are typically overlooked — out-of-school youth, those in under-resourced communities, and young women.", color: "var(--yah-orange)" },
  { title: "Systems-Focused", description: "We address the root problem: fragmented information and disconnected services. We fix the system, not just the symptom.", color: "var(--yah-teal)" },
  { title: "Accountable", description: "We measure what matters. Our MEL framework tracks every referral, placement, and outcome so we can prove and improve our impact.", color: "var(--yah-sky)" },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-16 md:py-20">
          <SectionHeading eyebrow="Who We Are" title="About Youth Access Hub"
            subtitle="We are an intermediary organisation that bridges the gap between young people and the support systems built for them — because having opportunities is meaningless if you can't access them."
            color="light" decorativeBar accent="orange" />
        </div>
        <div style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12" style={{ display: "block", fill: "var(--yah-white)" }}>
            <path d="M0,50 C480,10 960,50 1440,20 L1440,50 Z" />
          </svg>
        </div>
      </section>

      {/* Problem + Solution */}
      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading eyebrow="The Problem" title="A Fragmented System" decorativeBar accent="orange"
                subtitle="Many young people struggle not just with limited opportunities, but with navigating complex and fragmented support systems. Multiple organisations offer training, mentorship, employment pathways, and social assistance — yet youth often lack the information, networks, and guidance to access these services effectively." />
              <p className="mt-4 leading-relaxed text-sm" style={{ color: "var(--yah-slate)" }}>
                This disconnect results in underutilised programs, duplicated efforts, and missed opportunities for youth development. The challenge isn`t a lack of resources — it`s coordination.
              </p>
            </div>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)" }}>
              <SectionHeading eyebrow="Our Solution" title="YAH as the Bridge" decorativeBar accent="teal" />
              <ul className="mt-6 flex flex-col gap-4" role="list">
                {["Youth outreach and needs assessment", "Referral and linkage to partner organisations", "Coordination of professional clubs and networks", "Facilitation of mentorship and placement opportunities", "Partnership development and management", "Information sharing across institutions"].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(43,174,142,0.15)", color: "var(--yah-teal)" }} aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="text-sm" style={{ color: "var(--yah-slate)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--yah-navy)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--yah-orange)", fontFamily: "var(--font-heading)" }}>Our Vision</p>
              <p className="text-lg font-semibold leading-relaxed" style={{ color: "var(--yah-white)", fontFamily: "var(--font-heading)" }}>
                To empower youth by unlocking coordinated access to information, skills, opportunities, and support systems through strong cross-sector partnerships.
              </p>
            </div>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--yah-white)", border: "1px solid var(--yah-light-gray)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>Our Mission</p>
              <p className="text-lg font-semibold leading-relaxed" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>
                To connect youth to relevant organisations, resources, and opportunities by acting as a trusted intermediary that aligns education institutions, community organisations, industry, and support services around the needs of young people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ backgroundColor: "var(--yah-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" decorativeBar accent="orange" align="center" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ title, description, color }) => (
              <div key={title} className="p-6 rounded-xl" style={{ backgroundColor: "var(--yah-off-white)", border: "1px solid var(--yah-light-gray)" }}>
                <div className="w-2 h-8 rounded-full mb-4" style={{ backgroundColor: color }} aria-hidden="true" />
                <h3 className="font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--yah-slate)" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section style={{ backgroundColor: "var(--yah-off-white)" }}>
        <div className="container-yah py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SectionHeading eyebrow="Who We Serve" title="Our Beneficiaries" decorativeBar accent="teal"
              subtitle="Youth Access Hub serves a broad spectrum of young people, from primary school learners to recent graduates and out-of-school youth — as well as professionals who want to give back." />
            <div className="grid grid-cols-2 gap-4">
              {["Primary & Secondary Learners", "Tertiary Students", "Recent Graduates", "Out-of-School Youth", "Aspiring Mentors", "Partner Organisations"].map((group) => (
                <div key={group} className="p-4 rounded-xl text-sm font-semibold text-center"
                  style={{ backgroundColor: "var(--yah-white)", border: "1px solid var(--yah-light-gray)", color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>
                  {group}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: "var(--yah-navy)" }}>
        <div className="container-yah py-14 md:py-16 text-center flex flex-col items-center gap-5">
          <SectionHeading eyebrow="Get Involved" title="Ready to Connect?" align="center" color="light" decorativeBar accent="orange"
            subtitle="Whether you're a young person looking for opportunities, a professional wanting to mentor, or an organisation ready to partner — we want to hear from you." />
          <Link href="/contact">
            <Button variant="primary" size="lg" trailingIcon={<ArrowIcon />}>Get In Touch</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
