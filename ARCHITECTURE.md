# Youth Access Hub — Architecture Document

> **Living document.** Update this file whenever structural or technological changes occur.
> Last updated: 2026-06-19 | Phase: 6 — Supabase Backend & Admin Dashboard

---

## 1. Project Overview

**Organisation:** Youth Access Hub (YAH)
**Tagline:** Empowering Youth, Opening Opportunities
**Purpose:** Platform connecting young people to mentorship programs, growth opportunities, and partner organisations.
**Role of site:** Acts as the digital front door — communicating YAH's mission, showcasing what's available, and directing youth to take action. Executives manage all programs and opportunities content through a protected admin dashboard, without developer involvement.

---

## 2. Tech Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 | SSR/SSG/ISR, file-based routing, API routes, Server Actions |
| UI Library | React | 19.2.4 | Component model |
| Language | TypeScript | 5.x | Strict typing, maintainability |
| Styling (primary) | Tailwind CSS | 4.x | Utility-first, v4 CSS-native config |
| Styling (complex UI) | MUI + Emotion | v9 | Mobile drawer, complex form inputs only |
| Fonts | Poppins + Inter | — | Via next/font/google, zero layout shift |
| Database | Supabase (PostgreSQL) | — | Relational data, RLS for write protection |
| Auth | Supabase Auth (`@supabase/ssr`) | — | Executive login, session management via cookies |
| File storage | Supabase Storage | — | Cover images for programs and opportunities |
| Deployment | Vercel | — | Native Next.js host, zero config, on-demand ISR |
| CI | GitHub Actions | — | Lint + type-check on every PR |

### Version Warnings
- **Tailwind v4** uses CSS-native config (`@import "tailwindcss"`) — NO `tailwind.config.js`
- **Next.js 16 / React 19** — APIs may differ from training data. Check `node_modules/next/dist/docs/` before writing routing or data-fetching code.
- **MUI v9** — theming API changed. Only use for complex interactive components.
- **`@supabase/ssr`** is the only supported Supabase Next.js integration — the deprecated `@supabase/auth-helpers-nextjs` must never be used.

---

## 3. Architecture Evolution

| Phase | Data layer | Status |
|---|---|---|
| 1 | Static TypeScript files (`src/data/`) | Superseded |
| 2 (planned) | Sanity.io CMS | Not implemented — superseded by Phase 6 decision |
| 6 (current) | Supabase (PostgreSQL + Auth + Storage) | Complete |

The originally planned Sanity.io migration was replaced with **Supabase** to provide a unified database, authentication, and file storage solution alongside a custom-built admin dashboard, rather than a third-party headless CMS UI.

---

## 4. Folder Structure

```
youth-access-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── programs/
│   │   │   ├── page.tsx                    # revalidate = 60 (ISR fallback)
│   │   │   └── [slug]/page.tsx             # revalidate = 60
│   │   ├── opportunities/
│   │   │   ├── page.tsx                    # revalidate = 60
│   │   │   └── [slug]/page.tsx             # revalidate = 60
│   │   ├── partners/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── api/
│   │   │   └── contact/route.ts
│   │   └── admin/
│   │       ├── (auth)/
│   │       │   └── login/
│   │       │       └── page.tsx            # NO auth guard — must stay outside (dashboard)
│   │       └── (dashboard)/
│   │           ├── layout.tsx              # Auth guard + AdminShell
│   │           ├── loading.tsx
│   │           ├── page.tsx                # Dashboard overview
│   │           ├── programs/
│   │           │   ├── page.tsx
│   │           │   ├── loading.tsx
│   │           │   ├── new/page.tsx
│   │           │   └── [slug]/page.tsx
│   │           └── opportunities/
│   │               ├── page.tsx
│   │               ├── loading.tsx
│   │               ├── new/page.tsx
│   │               └── [slug]/page.tsx
│   │
│   ├── actions/                            # Server Actions — all DB writes live here
│   │   ├── programs.ts                     # create/update/delete/toggleStatus
│   │   └── opportunities.ts                # create/update/delete/toggleStatus
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── sections/
│   │   ├── forms/
│   │   │   └── ContactForm.tsx
│   │   └── admin/
│   │       ├── AdminShell.tsx              # Sidebar + topbar + mobile drawer
│   │       ├── ProgramsTable.tsx           # Client — calls server actions
│   │       ├── ProgramForm.tsx             # Client — calls server actions
│   │       ├── OpportunitiesTable.tsx      # Client — calls server actions
│   │       └── OpportunityForm.tsx         # Client — calls server actions
│   │
│   ├── data/                               # DEPRECATED — Phase 1 static content, no longer imported
│   │
│   ├── lib/
│   │   ├── getData.ts                      # Reads from Supabase — same signatures as Phase 1
│   │   ├── supabase/
│   │   │   ├── server.ts                   # Server Component / Server Action client
│   │   │   └── client.ts                   # Client Component client (browser)
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── program.ts
│   │   ├── opportunity.ts
│   │   └── partner.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   └── schema.sql                          # Full DB schema, RLS policies, storage bucket, seed data
│
├── middleware.ts                           # Session refresh + /admin route protection
├── ARCHITECTURE.md
├── AGENTS.md
└── CLAUDE.md
```

---

## 5. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `HowItWorks.tsx`, `AdminShell.tsx` |
| Pages | lowercase (Next.js) | `page.tsx` |
| Server Actions | camelCase verbs | `createProgram`, `toggleOpportunityStatus` |
| Types/interfaces | PascalCase, no `I` prefix | `Program`, `Opportunity` |
| DB columns | snake_case (Postgres convention) | `cover_image`, `how_to_apply` |
| TS object keys | camelCase (mapped via `getData.ts`) | `coverImage`, `howToApply` |
| Utility functions | camelCase | `slugify()`, `formatDate()` |
| CSS custom properties | `--yah-*` namespace | `--yah-navy` |
| Tailwind utilities | No custom classes — use CSS vars via arbitrary values | `bg-[var(--yah-navy)]` |

---

## 6. Brand & Design Tokens

Unchanged from Phase 1 — all design tokens live as CSS custom properties in `src/styles/globals.css`. The admin dashboard reuses the exact same token set for full visual consistency with the public site.

---

## 7. Data Layer Architecture

### Current: Supabase (PostgreSQL)

```
Supabase (programs / opportunities / partners tables)
        ↓
src/lib/getData.ts   (maps snake_case rows → camelCase TypeScript types)
        ↓
page / component
```

`getData.ts` exports the same async functions as Phase 1 (`getPrograms()`, `getOpportunities()`, etc.) — function signatures are unchanged, so no public-facing component required modification during the migration. Internally, each function now queries Supabase via the server client and maps the result through a dedicated row-mapper.

No component ever imports from `src/data/` directly — those files are deprecated and unused, kept only for historical reference until removed in a future cleanup.

### Writes: Server Actions only

All database writes (create, update, delete, status toggle) go through Server Actions in `src/actions/`. No client component calls Supabase directly for a write operation. This keeps:
- Authentication checks server-side (`requireAuth()` in each action)
- The Supabase service surface minimal and auditable
- `revalidatePath()` calls colocated with the mutation that requires them

The only client-side Supabase usage is the anon key browser client (`src/lib/supabase/client.ts`), used for:
- Reading the session (login, sign out)
- Uploading cover images directly to Storage (Option A — see section 9)

---

## 8. Admin Dashboard Architecture

### Route groups

```
src/app/admin/
├── (auth)/login/        ← NO layout guard, renders standalone
└── (dashboard)/         ← layout.tsx enforces auth, wraps in AdminShell
```

Route groups (`(name)`) do not affect the URL — `/admin/login` and `/admin/programs` resolve exactly as named. They exist purely to give `/admin/login` a different layout than the rest of `/admin/*`, preventing a redirect loop between the auth guard and the login page itself.

### Auth flow

```
Request to /admin/*
        ↓
middleware.ts — refreshes Supabase session, redirects to /admin/login if absent
        ↓
(dashboard)/layout.tsx — re-checks session server-side (belt-and-braces)
        ↓
AdminShell renders (sidebar, topbar, mobile drawer)
        ↓
Page content renders inside the shell
```

Executive accounts are created manually via Supabase Dashboard → Authentication → Users. There is no public sign-up route.

### CRUD pattern (Programs and Opportunities)

Both content types follow an identical pattern:

```
list page (page.tsx)          → Server Component, fetches all rows, renders <XTable>
XTable.tsx                    → Client Component, calls toggleXStatus() / deleteX() server actions
new/page.tsx                  → renders <XForm /> with no initial data
[slug]/page.tsx                → Server Component, fetches one row, renders <XForm data={...} />
XForm.tsx                     → Client Component, calls createX() / updateX() server actions
src/actions/x.ts               → Server Actions: createX, updateX, deleteX, toggleXStatus
```

### Image upload strategy

Cover images use a client-upload, server-write split (Option A):

1. Browser uploads the file directly to Supabase Storage (`yah-media` bucket) using the anon-key client
2. Browser receives the public URL back from Storage
3. Browser passes that URL — not the file — to the relevant Server Action
4. Server Action writes the URL to the `cover_image` column

This avoids streaming file bytes through the Next.js server while keeping all DB writes server-side.

---

## 9. On-Demand Revalidation (ISR)

Public pages (`/`, `/programs`, `/programs/[slug]`, `/opportunities`, `/opportunities/[slug]`) are statically generated with a `revalidate = 60` fallback. After any admin mutation, the relevant Server Action calls `revalidatePath()` directly:

```typescript
// src/actions/programs.ts
function revalidateProgramPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/programs");
  if (slug) revalidatePath(`/programs/${slug}`);
}
```

This means changes published by an executive appear on the live site immediately, without waiting for the 60-second fallback window or a full redeploy. There is no public API route for revalidation — it happens entirely within the server action's execution context, removing any need for a shared secret.

---

## 10. Page Routes & Responsibilities

| Route | Page | Data Source | Render Strategy |
|---|---|---|---|
| `/` | Home | programs, opportunities (featured) | SSG + ISR (60s + on-demand) |
| `/about` | About YAH | static | SSG |
| `/programs` | Mentorship listing | all programs | SSG + ISR |
| `/programs/[slug]` | Program detail | single program by slug | SSG + ISR |
| `/opportunities` | Opportunities listing | all opportunities | SSG + ISR |
| `/opportunities/[slug]` | Opportunity detail | single opportunity by slug | SSG + ISR |
| `/partners` | Partners | all partners | SSG |
| `/contact` | Contact | static + form POST | SSG + client form |
| `/api/contact` | Form handler | — | API Route (POST) |
| `/admin/login` | Executive login | Supabase Auth | Dynamic, no auth guard |
| `/admin` | Dashboard overview | Supabase counts | Dynamic, auth required |
| `/admin/programs` | Programs management | Supabase | Dynamic, auth required |
| `/admin/programs/new` | Create program | — | Dynamic, auth required |
| `/admin/programs/[slug]` | Edit program | Supabase | Dynamic, auth required |
| `/admin/opportunities` | Opportunities management | Supabase | Dynamic, auth required |
| `/admin/opportunities/new` | Create opportunity | — | Dynamic, auth required |
| `/admin/opportunities/[slug]` | Edit opportunity | Supabase | Dynamic, auth required |

---

## 11. Component Architecture

### Hierarchy (public site — unchanged from Phase 1)
```
app/page.tsx
  └── sections/Hero.tsx
  └── sections/StatsBar.tsx
  └── sections/HowItWorks.tsx
  └── sections/ProgramsGrid.tsx
        └── ui/Card.tsx
        └── ui/Badge.tsx
  └── sections/CTABanner.tsx
        └── ui/Button.tsx
```

### Hierarchy (admin dashboard)
```
app/admin/(dashboard)/layout.tsx
  └── components/admin/AdminShell.tsx        (sidebar, topbar, mobile drawer)
        └── app/admin/(dashboard)/programs/page.tsx
              └── components/admin/ProgramsTable.tsx
        └── app/admin/(dashboard)/programs/new/page.tsx
              └── components/admin/ProgramForm.tsx
```

### Rules
1. `ui/` components accept only props — no data fetching, no side effects
2. `sections/` components may receive data as props from parent pages
3. Pages are responsible for data fetching and passing to sections/tables/forms
4. No `any` types — every prop must be typed against `src/types/`
5. Admin forms and tables are Client Components that call Server Actions for all writes — never Supabase directly

---

## 12. Security

- Row Level Security (RLS) enabled on all three tables — public read access, authenticated-only write access. See `supabase/schema.sql`.
- Server Actions double as the authorization boundary — each calls `requireAuth()` before touching the database, independent of RLS.
- Middleware (`middleware.ts`) protects all `/admin/*` routes except `/admin/login`, redirecting unauthenticated requests.
- `(dashboard)/layout.tsx` re-verifies the session server-side as a second guard layer.
- No secrets are exposed to the browser. The Supabase anon key is public by design (protected by RLS); the service role key is never used in this codebase.
- Storage bucket `yah-media` is public-read (required for `<img>` tags on the public site) but write-protected to authenticated users only.
- Contact form: server-side validation in `api/contact/route.ts`, rate limiting via Vercel Edge Config (Phase 2, still planned)
- `.env.local` never committed — `.env.example` documents required keys

---

## 13. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  quality:
    - npm run lint
    - npx tsc --noEmit
    - npm test
```

Deployment: Vercel auto-deploys `main` branch. Preview deployments on all PRs. Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be set in Vercel project settings for all environments (Production, Preview, Development).

Supabase Auth Redirect URLs must include both the production domain and `localhost:3000` under Authentication → URL Configuration for login to function in every environment.

---

## 14. Roadmap & Technical Debt

### Completed (Phase 6)
- Supabase schema, RLS policies, storage bucket
- `getData.ts` migrated to Supabase — zero public component changes
- Executive authentication via Supabase Auth + `@supabase/ssr`
- Full admin dashboard — Programs and Opportunities CRUD
- Server Actions for all database writes
- On-demand ISR revalidation after every mutation
- Loading skeletons for dashboard and list pages

### Planned
- Remove deprecated `src/data/` static files entirely
- Server-side MIME type / size validation on image uploads (currently client-only)
- Newsletter signup integration (Mailchimp or Resend)
- Contact form email delivery via Resend API
- Rate limiting on API routes
- Partners CRUD in admin dashboard (currently programs + opportunities only)
- Test coverage for Server Actions and admin components

### Known Debt
- Contact form logs to console only — needs email integration before launch
- No automated test coverage yet
- MUI bundle included but minimally used — evaluate removal
- `src/data/*.ts` files remain in the repo but are fully unused — safe to delete after confirming no remaining references

---

## 15. Environment Variables

```bash
# .env.local (never commit)

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Reserved — not currently used in application code

# Email (Phase 2+, still planned)
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```

Note: the revalidation secret pattern (`REVALIDATE_SECRET`) used in an earlier iteration of this feature has been removed. Revalidation now happens via direct `revalidatePath()` calls inside Server Actions, requiring no secret or public API route.
