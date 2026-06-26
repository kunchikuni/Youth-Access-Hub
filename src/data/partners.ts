/**
 * Static partner data — Phase 1
 * Replace this with Sanity CMS queries in Phase 2 by updating lib/getData.ts only.
 * No component imports this file directly — always go through lib/getData.ts.
 *
 * @module data/partners
 */

import type { Partner } from "@/types/partner";

export const partners: Partner[] = [
  {
    slug: "cyaen-incorporated",
    name: "Cyaen Global",
    description: "National youth development body supporting youth empowerment in tech programs across Zimbabwe.",
    type: "corporate",
    contribution: "Access to national youth networks, co-facilitation of leadership programs, and policy alignment support.",
    featured: true,
    website: "https://www.cyaen.co.zw",
  },
  {
    slug: "econet-wireless",
    name: "Econet Wireless",
    description: "Zimbabwe's leading telecommunications company and corporate social responsibility partner.",
    type: "corporate",
    contribution: "Mentors from senior management, sponsorship of Career Mentorship Program, and digital access support.",
    featured: true,
    website: "https://www.econet.co.zw",
  },
  {
    slug: "techzim",
    name: "TechZim Partner Network",
    description: "Zimbabwe's technology ecosystem connecting digital businesses and tech talent.",
    type: "corporate",
    contribution: "IT internship placements, industry speakers, and digital skills training opportunities.",
    featured: true,
    website: "https://www.techzim.co.zw",
  },
 ]