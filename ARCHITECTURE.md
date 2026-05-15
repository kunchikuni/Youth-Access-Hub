# Youth Access Hub — Architecture Document

> **Living document.** Update this file whenever structural or technological changes occur.
> Last updated: 2026-05-06 | Phase: 1 — Foundation

---

## 1. Project Overview

**Organisation:** Youth Access Hub (YAH)
**Tagline:** Empowering Youth, Opening Opportunities
**Purpose:** Informational/marketing website that connects young people to mentorship programs, growth opportunities, and partner organisations.
**Role of site:** Acts as the digital front door — communicating YAH's mission, showcasing what's available, and directing youth to take action.

---

## 2. Tech Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 | SSR/SSG, file-based routing, API routes |
| UI Library | React | 19.2.4 | Component model |
| Language | TypeScript | 5.x | Strict typing, maintainability |
| Styling (primary) | Tailwind CSS | 4.x | Utility-first, v4 CSS-native config |
| Styling (complex UI) | MUI + Emotion | v9 | Mobile drawer, complex form inputs only |
| Fonts | Poppins + Inter | — | Via next/font/google, zero layout shift |
| Data (Phase 1) | Typed JSON/TS files | — | Zero infra cost, CMS-ready abstraction |
| Data (Phase 2+) | Sanity.io | — | Headless CMS for non-technical editors |
| Deployment | Vercel | — | Native Next.js host, zero config |
| CI | GitHub Actions | — | Lint + type-check on every PR |

### ⚠️ Version Warnings
- **Tailwind v4** uses CSS-native config (`@import "tailwindcss"`) — NO `tailwind.config.js`
- **Next.js 16 / React 19** — APIs may differ from training data. Check `node_modules/next/dist/docs/` before writing routing or data-fetching code.
- **MUI v9** — theming API changed. Only use for complex interactive components.

---

## 3. Folder Structure

```
youth-access-hub/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout: fonts, metadata, Navbar, Footer
│   │   ├── page.tsx                  # Home page
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── programs/
│   │   │   ├── page.tsx              # Mentorship listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual program detail
│   │   ├── opportunities/
│   │   │   ├── page.tsx              # Opportunities listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual opportunity detail
│   │   ├── partners/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts          # Contact form POST handler
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Responsive nav with mobile menu
│   │   │   └── Footer.tsx
│   │   ├── ui/                       # Atomic, reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── SectionHeading.tsx
│   │   ├── sections/                 # Page-level composed sections
│   │   │   ├── Hero.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── ProgramsGrid.tsx
│   │   │   ├── OpportunitiesGrid.tsx
│   │   │   ├── PartnersGrid.tsx
│   │   │   └── CTABanner.tsx
│   │   └── forms/
│   │       └── ContactForm.tsx
│   │
│   ├── data/                         # Phase 1: typed static content
│   │   ├── programs.ts               # Mentorship program data
│   │   ├── opportunities.ts          # Growth opportunity data
│   │   └── partners.ts               # Partner organisation data
│   │
│   ├── lib/
│   │   ├── getData.ts                # Data abstraction layer (swap for Sanity later)
│   │   └── utils.ts                  # cn(), formatDate(), slugify()
│   │
│   ├── types/
│   │   ├── program.ts
│   │   ├── opportunity.ts
│   │   └── partner.ts
│   │
│   └── styles/
│       └── globals.css               # Tailwind v4 entry + YAH CSS custom properties
│
├── public/
│   └── images/                       # Static assets, logo files
│
├── tests/
│   ├── components/                   # Component unit tests (Jest + RTL)
│   └── lib/                          # Utility unit tests
│
├── ARCHITECTURE.md                   # This file
├── AGENTS.md                         # AI agent instructions
├── CLAUDE.md                         # Claude-specific instructions
└── .env.local                        # Never committed — see .env.example
```

---

## 4. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `HowItWorks.tsx` |
| Pages | lowercase (Next.js) | `page.tsx` |
| Types/interfaces | PascalCase, no `I` prefix | `Program`, `Opportunity` |
| Data files | camelCase | `programs.ts` |
| Utility functions | camelCase | `slugify()`, `formatDate()` |
| CSS custom properties | `--yah-*` namespace | `--yah-navy` |
| Tailwind utilities | No custom classes — use CSS vars via arbitrary values | `bg-[var(--yah-navy)]` |

---

## 5. Brand & Design Tokens

All design tokens live as CSS custom properties in `src/styles/globals.css`.

### Colours
| Token | Hex | Usage |
|---|---|---|
| `--yah-navy` | `#1B2F6B` | Primary text, nav background, headings |
| `--yah-orange` | `#F5A623` | CTAs, accent highlights, hover states |
| `--yah-teal` | `#2BAE8E` | Secondary actions, icons, success states |
| `--yah-sky` | `#4A9FD4` | Tertiary accent, links, info states |
| `--yah-white` | `#FFFFFF` | Backgrounds, inverted text |
| `--yah-off-white` | `#F8F9FC` | Section alternating backgrounds |
| `--yah-slate` | `#64748B` | Body text on light backgrounds |

### Typography
| Token | Value | Usage |
|---|---|---|
| `--font-heading` | Poppins | All headings H1–H4 |
| `--font-body` | Inter | Body copy, UI labels |

### Spacing Scale
Standard Tailwind spacing scale. No custom tokens needed.

---

## 6. Data Layer Architecture

### Phase 1 (current): Static TypeScript data files

```
src/data/programs.ts   →   src/lib/getData.ts   →   page/component
```

`getData.ts` exports async functions (`getPrograms()`, `getOpportunities()`, etc.) that currently read from static data files. **No component ever imports from `src/data/` directly** — all data access goes through `lib/getData.ts`. This is the abstraction boundary.

### Phase 2 (future): Sanity CMS

When migrating to Sanity, only `lib/getData.ts` changes — swap static imports for GROQ queries. Zero component changes required.

```typescript
// Phase 1
export async function getPrograms(): Promise<Program[]> {
  return programs; // from static data
}

// Phase 2 (drop-in replacement)
export async function getPrograms(): Promise<Program[]> {
  return sanityClient.fetch(PROGRAMS_QUERY);
}
```

---

## 7. Page Routes & Responsibilities

| Route | Page | Data Source | Render Strategy |
|---|---|---|---|
| `/` | Home | programs, opportunities (featured) | SSG |
| `/about` | About YAH | static | SSG |
| `/programs` | Mentorship listing | all programs | SSG |
| `/programs/[slug]` | Program detail | single program by slug | SSG (generateStaticParams) |
| `/opportunities` | Opportunities listing | all opportunities | SSG |
| `/opportunities/[slug]` | Opportunity detail | single opportunity by slug | SSG |
| `/partners` | Partners | all partners | SSG |
| `/contact` | Contact | static + form POST | SSG + client form |
| `/api/contact` | Form handler | — | API Route (POST) |

All public pages are **statically generated at build time** for maximum performance. The contact API route is the only server-side runtime endpoint in Phase 1.

---

## 8. Component Architecture

### Hierarchy
```
app/page.tsx
  └── sections/Hero.tsx           (composed, page-specific)
  └── sections/StatsBar.tsx
  └── sections/HowItWorks.tsx
  └── sections/ProgramsGrid.tsx
        └── ui/Card.tsx           (atomic, reusable)
        └── ui/Badge.tsx
  └── sections/CTABanner.tsx
        └── ui/Button.tsx
```

### Rules
1. **`ui/` components** accept only props — no data fetching, no side effects
2. **`sections/` components** may receive data as props from parent pages
3. **Pages** are responsible for data fetching and passing to sections
4. **No `any` types** — every prop must be typed against `src/types/`

---

## 9. Security

- Contact form: server-side validation in `api/contact/route.ts`, rate limiting via Vercel Edge Config (Phase 2)
- No secrets in client bundle — all env vars prefixed `NEXT_PUBLIC_` only if truly needed on client
- `.env.local` never committed — `.env.example` documents required keys
- Input sanitisation on all API routes before any external calls

---

## 10. CI/CD Pipeline (Phase 5)

```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  quality:
    - npm run lint
    - npx tsc --noEmit
    - npm test
```

Deployment: Vercel auto-deploys `main` branch. Preview deployments on all PRs.

---

## 11. Roadmap & Technical Debt

### Planned (Phase 2+)
- [ ] Migrate data layer to Sanity CMS
- [ ] Add Sanity Studio at `/studio` route
- [ ] Newsletter signup integration (Mailchimp or Resend)
- [ ] Contact form email delivery via Resend API
- [ ] Rate limiting on API routes
- [ ] Image optimisation pipeline for partner logos

### Known Debt
- Phase 1 contact form logs to console only — needs email integration before launch
- No test coverage in Phase 1 — Jest setup deferred to Phase 4
- MUI bundle included but minimally used — evaluate removal after Phase 3

---

## 12. Environment Variables

```bash
# .env.local (never commit)

# Phase 1 — none required

# Phase 2+ (Sanity)
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_TOKEN=

# Phase 2+ (Email)
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```
