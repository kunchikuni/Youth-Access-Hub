/**
 * Program type definitions
 * Represents a mentorship program offered or coordinated by Youth Access Hub.
 *
 * @module types/program
 */

export type ProgramCategory =
  | "mentorship"
  | "skills"
  | "leadership"
  | "entrepreneurship"
  | "career";

export type ProgramStatus = "open" | "closed" | "coming-soon";

export interface Mentor {
  /** Full name of the mentor */
  name: string;
  /** Professional title or role */
  title: string;
  /** Organisation or company the mentor is affiliated with */
  organisation: string;
  /** Short bio (max 200 characters) */
  bio: string;
  /** Path to mentor photo in /public/images/mentors/ */
  photo?: string;
  /** LinkedIn profile URL */
  linkedIn?: string;
}

export interface Program {
  /** Unique identifier — used for URL slug routing */
  slug: string;
  /** Display name of the program */
  title: string;
  /** One-line summary shown on cards */
  tagline: string;
  /** Full description for detail page */
  description: string;
  /** Content category for filtering */
  category: ProgramCategory;
  /** Whether the program is accepting participants */
  status: ProgramStatus;
  /** Duration string e.g. "6 weeks", "3 months" */
  duration: string;
  /** Target audience e.g. "Secondary school learners", "University students" */
  audience: string;
  /** Key outcomes or skills youth will gain */
  outcomes: string[];
  /** Mentor(s) leading this program */
  mentors: Mentor[];
  /** Whether to feature on the homepage */
  featured: boolean;
  /** Public URL of the cover image (from Supabase Storage) */
  coverImageUrl?: string | null;
  /** ISO date string of program start */
  startDate?: string;
  /** Partner organisation providing the program */
  partner?: string;
}
