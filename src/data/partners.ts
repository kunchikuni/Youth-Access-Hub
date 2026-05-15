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
    slug: "zimbabwe-youth-council",
    name: "Zimbabwe Youth Council",
    description: "National youth development body supporting youth empowerment programs across Zimbabwe.",
    type: "government",
    contribution: "Access to national youth networks, co-facilitation of leadership programs, and policy alignment support.",
    featured: true,
    website: "https://www.zyc.org.zw",
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
  {
    slug: "university-of-zimbabwe",
    name: "University of Zimbabwe",
    description: "Zimbabwe's oldest and largest university, partnering to connect students to YAH's network.",
    type: "university",
    contribution: "Campus access points, student referrals, and co-hosting of career readiness workshops.",
    featured: true,
    website: "https://www.uz.ac.zw",
  },
  {
    slug: "kurera-ventures",
    name: "Kurera Ventures",
    description: "Early-stage startup studio and ecosystem builder focused on Zimbabwe and the region.",
    type: "corporate",
    contribution: "Entrepreneurship mentors, pitch coaching, and connections to startup funding opportunities.",
    featured: false,
  },
  {
    slug: "harare-city-youth-department",
    name: "Harare City Youth Department",
    description: "Municipal government department responsible for youth services in Harare.",
    type: "government",
    contribution: "Community access points, venue support, and co-referral for youth support services.",
    featured: false,
  },
];
