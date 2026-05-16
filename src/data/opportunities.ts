/**
 * Static opportunities data — Phase 1
 * Replace this with Sanity CMS queries in Phase 2 by updating lib/getData.ts only.
 * No component imports this file directly — always go through lib/getData.ts.
 *
 * @module data/opportunities
 */

import type { Opportunity } from "@/types/opportunity";

export const opportunities: Opportunity[] = [
  {
    slug: "junior-it-internship-techzim",
    title: "Junior IT Internship — TechZim Partners",
    tagline: "Get hands-on tech experience at one of Zimbabwe's leading digital firms.",
    description:
      "A 3-month paid internship opportunity for tertiary students and recent graduates in IT-related fields. Interns are placed with TechZim partner companies across Harare and gain practical experience in software development, IT support, or digital marketing. YAH coordinates the application, placement, and support process.",
    category: "internship",
    status: "open",
    provider: "TechZim Partner Network",
    location: "Harare",
    audience: "IT/Computer Science students and recent graduates",
    eligibility: [
      "Currently enrolled in or recently completed an IT-related tertiary qualification",
      "Age 18–28",
      "Zimbabwean national or resident",
      "Available for full-time commitment for 3 months",
    ],
    howToApply:
      "Register with Youth Access Hub and indicate your interest in IT internships during your onboarding session. YAH will coordinate your referral to the partner company.",
    deadline: "2026-05-31",
    featured: true,
    applyUrl: undefined,
  },
  {
    slug: "youth-skills-training-grant",
    title: "Youth Skills Training Grant",
    tagline: "Fund your skills development — applications now open.",
    description:
      "A grant of up to USD 500 available to youth aged 18–30 to cover costs of accredited skills training programs. Funded through YAH's donor partnerships, grants are awarded on a competitive basis to applicants who demonstrate clear development goals and financial need. YAH supports recipients through the application and training process.",
    category: "funding",
    status: "open",
    provider: "Youth Access Hub (donor-funded)",
    location: "Nationwide (Zimbabwe)",
    audience: "Youth aged 18–30 seeking vocational or professional training",
    eligibility: [
      "Zimbabwean national aged 18–30",
      "Accepted or enrolled in an accredited training program",
      "Demonstrates financial need",
      "Not currently employed full-time",
    ],
    howToApply:
      "Complete the Grant Application Form available through YAH. Applications are reviewed on a rolling basis by the YAH Program Management Unit.",
    deadline: "2026-06-30",
    featured: true,
  },
  {
    slug: "community-volunteer-placement",
    title: "Community Volunteer Placement",
    tagline: "Give back, build your CV, and grow your network.",
    description:
      "YAH coordinates structured volunteer placements with community organisations, NGOs, and social enterprises across Zimbabwe. Placements are matched to youth interests and skills, and come with structured support and an outcome certificate. Ideal for youth building their professional profile or exploring career directions.",
    category: "volunteering",
    status: "open",
    provider: "YAH Partner NGOs & Community Organisations",
    location: "Harare and surrounding areas",
    audience: "Secondary school leavers, tertiary students, recent graduates",
    eligibility: [
      "Aged 16–30",
      "Able to commit minimum 1 day per week for 8 weeks",
      "Registered with Youth Access Hub",
    ],
    howToApply:
      "Speak to a YAH coordinator at any of our access points or contact us directly. We'll match you with a placement suited to your interests.",
    featured: false,
  },
  {
    slug: "university-scholarship-linkage",
    title: "University Scholarship Linkage Program",
    tagline: "Connecting talented youth to scholarship opportunities across Africa.",
    description:
      "YAH maintains an up-to-date database of scholarship opportunities from local and international universities and donor organisations. Our coordinators help eligible youth identify, prepare, and apply for scholarships aligned with their academic and career goals. This is a guided referral service, not a direct scholarship award.",
    category: "scholarship",
    status: "coming-soon",
    provider: "Various Universities and Donor Organisations",
    location: "Remote / Various",
    audience: "High-achieving secondary school learners and Form 6 students",
    eligibility: [
      "Strong academic record",
      "Aged 16–22",
      "Registered with Youth Access Hub",
      "Zimbabwean national",
    ],
    howToApply:
      "Register with YAH and flag your interest in scholarship support. A coordinator will contact you to begin the scholarship identification process.",
    featured: false,
  },
];
