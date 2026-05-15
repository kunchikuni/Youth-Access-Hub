/**
 * Opportunity type definitions
 * Represents a growth opportunity (internship, funding, training, placement)
 * surfaced through Youth Access Hub's partner network.
 *
 * @module types/opportunity
 */

export type OpportunityCategory =
  | "internship"
  | "employment"
  | "funding"
  | "training"
  | "volunteering"
  | "scholarship";

export type OpportunityStatus = "open" | "closed" | "coming-soon";

export interface Opportunity {
  /** Unique identifier — used for URL slug routing */
  slug: string;
  /** Display title of the opportunity */
  title: string;
  /** One-line summary shown on cards */
  tagline: string;
  /** Full description for detail page */
  description: string;
  /** Opportunity type for filtering */
  category: OpportunityCategory;
  /** Whether the opportunity is currently accepting applications */
  status: OpportunityStatus;
  /** Organisation providing the opportunity */
  provider: string;
  /** Location — "Remote", "Harare", "Nationwide", etc. */
  location: string;
  /** Target audience */
  audience: string;
  /** Eligibility requirements as bullet points */
  eligibility: string[];
  /** How to apply or get referred */
  howToApply: string;
  /** Application deadline ISO date string */
  deadline?: string;
  /** Whether to feature on the homepage */
  featured: boolean;
  /** External application URL if applicable */
  applyUrl?: string;
}
