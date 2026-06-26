/**
 * Meta Icons
 * Small inline SVG icons (Heroicons outline, 24x24) used to replace
 * emoji in program/opportunity metadata rows â€” location, provider,
 * deadline, duration, audience, start date, partner.
 *
 * Source: Heroicons (MIT licence) â€” https://heroicons.com
 * Inlined directly rather than via package import to match the
 * existing pattern used by ProgramIcon / OpportunityIcon in this codebase.
 *
 * @module components/ui/MetaIcons
 */

interface IconProps {
  size?: number;
}

/** Map pin â€” used for location */
export function LocationIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21c-4.5-4.5-7-8.014-7-11a7 7 0 1114 0c0 2.986-2.5 6.5-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** Building â€” used for provider / organisation / partner */
export function BuildingIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h1M9 13h1M14 9h1M14 13h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

/** Clock â€” used for duration / deadline countdown */
export function ClockIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

/** Calendar â€” used for deadline date / start date */
export function CalendarIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

/** Academic cap â€” used for audience / target group */
export function AudienceIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M7 9.5V15c0 1.5 2.5 3 5 3s5-1.5 5-3V9.5" />
      <path d="M21 7.5v5" />
    </svg>
  );
}

/** Handshake-ish (two linked circles) â€” used for partner organisation */
export function PartnerIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M3 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M11 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  );
}

/** People / group â€” used for mentor count */
export function PeopleIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
