/**
 * ProgramsGrid Section
 *
 * Displays featured mentorship programs on the homepage.
 * Data flows from the page (server component) → this section → Card atoms.
 *
 * Props:
 *  - programs: Program[] — pre-fetched featured programs from getData.ts
 *
 * @module components/sections/ProgramsGrid
 */

import Link from "next/link";
import type { Program } from "@/types/program";
import Card, { CardHeader, CardBody, CardFooter, CardIcon } from "@/components/ui/Card";
import Badge, { statusBadge, categoryBadge } from "@/components/ui/Badge";
import Button, { ArrowIcon } from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

// ─── Icons per category ────────────────────────────────────────────────────

function ProgramIcon({ category }: { category: Program["category"] }) {
  const icons: Record<Program["category"], React.ReactNode> = {
    mentorship: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    leadership: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    entrepreneurship: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    skills: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    career: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  };
  return <>{icons[category] ?? icons.mentorship}</>;
}

const iconColors: Record<Program["category"], "teal" | "orange" | "sky" | "navy"> = {
  mentorship: "teal",
  leadership: "orange",
  entrepreneurship: "orange",
  skills: "sky",
  career: "navy",
};

// ─── Component ─────────────────────────────────────────────────────────────

interface ProgramsGridProps {
  programs: Program[];
}

export default function ProgramsGrid({ programs }: ProgramsGridProps) {
  return (
    <section
      style={{ backgroundColor: "var(--yah-off-white)" }}
      aria-labelledby="programs-heading"
    >
      <div className="container-yah py-16 md:py-24">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow="Our Programs"
            title="Mentorship That Opens Doors"
            subtitle="Structured programs connecting young people with professionals who've walked the path before them."
            decorativeBar
            accent="orange"
            id="programs-heading"
          />
          <Link
            href="/programs"
            className="flex-shrink-0 self-start md:self-auto"
          >
            <Button variant="outline" size="sm" trailingIcon={<ArrowIcon size={14} />}>
              All Programs
            </Button>
          </Link>
        </div>

        {/* Cards grid */}
        {programs.length === 0 ? (
          <p style={{ color: "var(--yah-slate)" }}>
            No programs available at the moment. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link
                key={program.slug}
                href={`/programs/${program.slug}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yah-orange)] rounded-[var(--radius-lg)]"
                aria-label={`View ${program.title}`}
              >
                <Card
                  variant={program.featured ? "featured" : "default"}
                  interactive
                  className="h-full flex flex-col"
                >
                  <CardHeader>
                    <CardIcon color={iconColors[program.category]}>
                      <ProgramIcon category={program.category} />
                    </CardIcon>
                    <div className="flex flex-wrap gap-2">
                      <Badge {...categoryBadge(program.category)} />
                      <Badge {...statusBadge(program.status)} dot />
                    </div>
                  </CardHeader>

                  <CardBody className="flex-1">
                    <h3
                      className="font-bold text-lg mb-2 leading-snug"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: program.featured ? "var(--yah-white)" : "var(--yah-navy)",
                      }}
                    >
                      {program.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{
                        color: program.featured
                          ? "rgba(255,255,255,0.72)"
                          : "var(--yah-slate)",
                      }}
                    >
                      {program.tagline}
                    </p>

                    {/* Meta row */}
                    <div
                      className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                      style={{
                        color: program.featured
                          ? "rgba(255,255,255,0.5)"
                          : "var(--yah-slate)",
                      }}
                    >
                      <span>⏱ {program.duration}</span>
                      <span>🎓 {(program.audience || "Youth").split(" ").slice(0, 3).join(" ")}</span>
                    </div>
                  </CardBody>

                  <CardFooter
                    bordered
                    className="flex items-center justify-between"
                    style={
                      program.featured
                        ? { borderTopColor: "rgba(255,255,255,0.12)" }
                        : undefined
                    }
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: program.featured ? "var(--yah-orange)" : "var(--yah-teal)",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {program.mentors.length} mentor{program.mentors.length !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{
                        color: program.featured ? "rgba(255,255,255,0.6)" : "var(--yah-navy)",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      Learn More →
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
