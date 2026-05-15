/**
 * Static program data — Phase 1
 * Replace this with Sanity CMS queries in Phase 2 by updating lib/getData.ts only.
 * No component imports this file directly — always go through lib/getData.ts.
 *
 * @module data/programs
 */

import type { Program } from "@/types/program";

export const programs: Program[] = [
  {
    slug: "career-mentorship-program",
    title: "Career Mentorship Program",
    tagline: "Guided by professionals who've walked the path before you.",
    description:
      "The Career Mentorship Program pairs young people with experienced professionals across multiple industries. Over 12 weeks, mentors provide structured guidance on career planning, professional skills, and navigating the job market. Sessions are a mix of one-on-one meetings and group workshops facilitated through YAH's network of partner organisations.",
    category: "mentorship",
    status: "open",
    duration: "12 weeks",
    audience: "Tertiary students and recent graduates (18–30)",
    outcomes: [
      "Clear career roadmap and goal-setting framework",
      "Professional CV and interview preparation",
      "Introduction to mentor's industry network",
      "Soft skills: communication, time management, workplace readiness",
    ],
    mentors: [
      {
        name: "Dr. Tendai Moyo",
        title: "Senior Economist",
        organisation: "Ministry of Finance",
        bio: "15 years in public finance and economic policy. Passionate about youth economic inclusion and financial literacy.",
      },
      {
        name: "Rudo Chikwanda",
        title: "Marketing Director",
        organisation: "Econet Wireless",
        bio: "Award-winning marketer with expertise in digital strategy and brand building across Southern Africa.",
      },
    ],
    featured: true,
    startDate: "2026-06-01",
    partner: "Econet Wireless",
  },
  {
    slug: "leadership-development-program",
    title: "Leadership Development Program",
    tagline: "Building the next generation of community leaders.",
    description:
      "A structured 8-week program designed to develop leadership competencies in young people aged 16–25. Participants engage in workshops, community projects, and mentorship sessions that build self-awareness, decision-making, and the ability to mobilise others. The program is run in partnership with community organisations and schools across Harare.",
    category: "leadership",
    status: "open",
    duration: "8 weeks",
    audience: "Secondary school learners and youth (16–25)",
    outcomes: [
      "Foundational leadership frameworks and self-assessment",
      "Facilitation and public speaking skills",
      "Community project planning and execution",
      "Certificate of completion recognised by partner organisations",
    ],
    mentors: [
      {
        name: "Farai Mutasa",
        title: "Community Development Officer",
        organisation: "Zimbabwe Youth Council",
        bio: "Youth development practitioner with 10+ years working in community-based leadership and civic engagement programs.",
      },
    ],
    featured: true,
    startDate: "2026-07-01",
  },
  {
    slug: "entrepreneurship-mentorship",
    title: "Young Entrepreneurs Mentorship",
    tagline: "Turn your idea into something real with the right guidance.",
    description:
      "Designed for youth with business ideas or early-stage ventures, this mentorship program connects aspiring entrepreneurs with established business owners and startup ecosystem players. Mentors guide participants through business model validation, financial basics, pitching, and accessing startup support resources in Zimbabwe.",
    category: "entrepreneurship",
    status: "coming-soon",
    duration: "10 weeks",
    audience: "Youth with business ideas or early ventures (18–30)",
    outcomes: [
      "Validated business model canvas",
      "Basic financial planning and budgeting skills",
      "Pitch deck development and presentation coaching",
      "Connections to YAH's entrepreneurship partner network",
    ],
    mentors: [
      {
        name: "Simba Ncube",
        title: "Founder & CEO",
        organisation: "Kurera Ventures",
        bio: "Serial entrepreneur and startup mentor. Has founded and co-founded three businesses and actively supports early-stage founders across Zimbabwe.",
      },
    ],
    featured: false,
    startDate: "2026-09-01",
  },
];
