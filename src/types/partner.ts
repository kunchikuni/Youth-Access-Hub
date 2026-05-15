/**
 * Partner type definitions
 * Represents an organisation that partners with Youth Access Hub to provide
 * services, opportunities, venues, mentors, or resources to youth.
 *
 * @module types/partner
 */

export type PartnerType =
  | "school"
  | "university"
  | "ngo"
  | "corporate"
  | "government"
  | "community";

export interface Partner {
  /** Unique identifier — used for URL slug if detail pages are added */
  slug: string;
  /** Organisation name */
  name: string;
  /** One-line description of what they provide */
  description: string;
  /** Organisation type for grouping/filtering */
  type: PartnerType;
  /** Path to logo in /public/images/partners/ */
  logo?: string;
  /** Organisation website */
  website?: string;
  /** What this partner specifically provides to YAH's network */
  contribution: string;
  /** Whether to feature prominently on the Partners page */
  featured: boolean;
}
