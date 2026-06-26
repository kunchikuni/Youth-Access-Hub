# Youth Access Hub — Architecture Document

> **Living document.** Update this file whenever structural or technological changes occur.
> Last updated: 2026-06-26 | Phase: 7 — Admin Security Hardening

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
│   │       │                                # Wrapped in <Suspense> internally: useSearchParams()
│   │       │                                # (used for the idle-timeout message) requires it,
│   │       │                                # or the production build fails.
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
│   │   ├── programs.ts                     # create/update/delete/toggleStatus + audit logging
│   │   ├── opportunities.ts                # create/update/delete/toggleStatus + audit logging
│   │   └── auth.ts                         # checkLockout / recordLoginAttempt
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
│   │   ├── utils.ts
│   │   └── auditLog.ts                     # logAuditEntry() — writes to audit_log table
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
│   ├── schema.sql                          # Full DB schema, RLS policies, storage bucket, seed data
│   └── security/
│       └── schema-additions.sql            # login_attempts + audit_log tables, see §12.2 / §12.4
│
├── middleware.ts                           # Session refresh + /admin route protection
├── next.config.ts                          # Security headers (CSP, HSTS, etc.) — see §12.5
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

This section covers the full set of security controls in the application, including the hardening pass completed after the initial admin dashboard build (branch: `feat/admin-security-hardening`).

### 12.1 Authentication & session management

- Row Level Security (RLS) enabled on `programs`, `opportunities`, `partners` — public read access, authenticated-only write access. See `supabase/schema.sql`.
- Server Actions double as the authorization boundary — each calls `requireAuth()` before touching the database, independent of RLS.
- Middleware (`middleware.ts`) protects all `/admin/*` routes except `/admin/login`, redirecting unauthenticated requests.
- `(dashboard)/layout.tsx` re-verifies the session server-side as a second guard layer.
- No secrets are exposed to the browser. The Supabase anon key is public by design (protected by RLS); the service role key is never used in this codebase.
- Storage bucket `yah-media` is public-read (required for `<img>` tags on the public site) but write-protected to authenticated users only.
- `.env.local` never committed — `.env.example` documents required keys.

### 12.2 Login lockout

- `src/actions/auth.ts` exports `checkLockout()` and `recordLoginAttempt()`.
- Tracked in a dedicated `login_attempts` table (see `supabase/security/schema-additions.sql`) — email, timestamp, success flag.
- **Threshold:** 5 failed attempts within a 15-minute rolling window locks that email out for 15 minutes from the most recent failure.
- Lockout is checked **before** Supabase Auth is contacted at all — a locked-out attempt never reaches `signInWithPassword()`, so it cannot itself be used to keep probing.
- Lockout is per-email, not per-IP. This was a deliberate scope decision: it stops credential-stuffing against one specific account without needing IP-based infrastructure, which Vercel's serverless model makes harder to reason about reliably.
- RLS on `login_attempts` permits anonymous insert/select, because lockout checks happen before any session exists. The data stored there (email + timestamp + success) is low-sensitivity by design.
- The login page (`(auth)/login/page.tsx`) shows the user how many attempts remain, and a clear "try again in N minutes" message once locked, rather than failing silently.

### 12.3 Idle session timeout

- Implemented in `components/admin/AdminShell.tsx`, since it wraps every authenticated admin page.
- **Timeout:** 30 minutes of no activity (mouse move, keypress, click, scroll, touch — throttled to once/second) triggers automatic sign-out.
- **Warning:** at 29 minutes idle, a modal appears ("Your session is about to expire") with "Stay signed in" / "Sign out now" options, giving the executive a chance to extend the session deliberately.
- On timeout, sign-out redirects to `/admin/login?reason=idle`, and the login page shows a calm explanatory notice rather than a bare error.
- This is purely client-side (activity tracked in the browser) — it does not shorten the underlying Supabase JWT session, which has its own expiry/refresh handled by `@supabase/ssr`. The idle timer is a UX/security layer on top of that, specific to unattended admin sessions.

### 12.4 Audit logging

- Every `create`, `update`, `delete`, and `status_toggle` action on a program or opportunity writes one row to `audit_log` (see `supabase/security/schema-additions.sql`).
- Each entry records: user ID + email, action type, entity type/slug/title, and for status toggles, the before/after values (`changes` jsonb column).
- Logging happens via `src/lib/auditLog.ts`'s `logAuditEntry()`, called from within each server action **after** the underlying mutation has already succeeded. Logging failures are caught and logged to console — they never roll back or block the real mutation.
- For deletes specifically, the entity's title is fetched **before** the row is removed, so the audit trail stays human-readable even after the data itself is gone.
- `audit_log` RLS has **no update or delete policy** — entries are append-only at the application layer by design. Only a Supabase service-role key (not used anywhere in this codebase) could alter audit history directly in the database.
- There is currently no UI to browse the audit log — it exists as a data layer for future use (e.g. an `/admin/audit-log` viewer) or direct inspection via Supabase Table Editor if ever needed.

### 12.5 Security headers (CSP and related)

Configured in `next.config.ts` via the `headers()` function, applied to every route.

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | See below | Restricts script/style/image/connection sources |
| `X-Frame-Options` | `DENY` | Blocks embedding in iframes (clickjacking) |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage cross-origin |
| `Permissions-Policy` | camera/mic/geolocation/payment/usb/browsing-topics all disabled | Reduces browser feature attack surface |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS (production only, harmless in dev) |

**CSP specifics and the tradeoffs behind them:**

```
default-src 'self';
script-src 'self' 'unsafe-inline'[ 'unsafe-eval' in dev only ];
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

- **`'unsafe-inline'` on `style-src`** is required because admin components (`AdminShell`, `ProgramForm`, `OpportunityForm`, the tables, the login page) all use inline `<style>` tags for component-scoped CSS, and MUI (where still present) injects styles at runtime via Emotion.
- **`'unsafe-inline'` on `script-src`** is required because Next.js itself injects a small inline `<script>` on every page to bootstrap hydration and deliver the RSC payload. Without it, React's HTML/CSS renders but never hydrates — confirmed directly during this hardening pass, where the admin login page rendered its layout but none of its interactive form elements worked until this was added.
- **`'unsafe-eval'`** is added **only when `NODE_ENV === "development"`**, because React's dev-mode debugging (readable call stacks in error overlays) relies on `eval()`. Production never includes it — neither React nor Next.js use `eval()` in production builds.
- **Nonce-based CSP** (the stricter alternative to `'unsafe-inline'`) was deliberately not used. Nonces require every page with inline scripts/styles to opt into dynamic rendering, which directly conflicts with this project's SSG + ISR architecture (`revalidate = 60` on `/programs`, `/opportunities`, and their detail pages — see §9). This tradeoff should be revisited only if the public site is ever migrated to fully dynamic rendering.
- Even with `'unsafe-inline'`, `script-src` has no third-party origins listed — it still blocks any script loaded from an external domain, which is the more common real-world XSS vector compared to inline scripts in a codebase the team controls directly.
- `connect-src` explicitly allow-lists `https://*.supabase.co` — without this, the browser-side Supabase client (login, image upload) would be silently blocked by the CSP.

### 12.6 CSRF protection

No custom CSRF token system was built, and this was a deliberate decision rather than an oversight:

- **All state-changing admin operations go through Next.js Server Actions** (`src/actions/programs.ts`, `src/actions/opportunities.ts`, `src/actions/auth.ts`). Server Actions have CSRF protection built into the framework: each action is assigned an encrypted, unguessable action ID at build time, and Next.js validates the request's `Origin` header against the deployment's configured origin before executing the action. A request forged from a different origin is rejected before the action body ever runs.
- **The only direct browser-to-Supabase calls** are authentication (`signInWithPassword`, `signOut`) and Storage uploads, both using the public anon key over HTTPS. These aren't cookie-session-based form posts in the traditional CSRF sense — they're authenticated API calls protected by Supabase's own RLS policies and the anon key's scope, not by ambient cookie credentials that a third-party site could silently ride along with.
- **No traditional `<form action="...">` POST endpoints exist** in this codebase outside of `api/contact/route.ts`, which only accepts a name/email/message and has server-side validation; it has no destructive or sensitive effect that would benefit from a CSRF token in this context.
- Net result: the attack CSRF tokens exist to prevent (a third-party site silently triggering a state change using the victim's ambient session) is already structurally hard to achieve here, because the privileged write paths are Server Actions (origin-checked by the framework) rather than classic cookie-authenticated form posts.

### 12.7 Known limitations / explicitly deferred

- **Server action rate limiting** (e.g. capping mutations per executive per minute) was considered and explicitly deferred — for the current admin team size, the risk/cost tradeoff didn't justify the added complexity and potential for false-positive lockouts during legitimate fast editing. Revisit if the team grows or abuse is observed.
- **Image upload validation** is currently client-side only (`accept="image/jpeg,image/png,image/webp"` on the file input). There is no server-side MIME-type or size re-validation before the file reaches Supabase Storage. Still listed in the roadmap below.
- Login lockout is per-email, not per-IP — see §12.2 for the reasoning.

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

### Completed (Phase 7 — Security Hardening)
- Login lockout: 5 failed attempts → 15-minute lockout, tracked in `login_attempts`
- Idle session timeout: 30 minutes inactivity → auto sign-out, with 1-minute warning
- Audit logging: every create/update/delete/status-toggle recorded in `audit_log`
- Security headers via `next.config.ts`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS
- CSRF: verified and documented as covered by Server Actions' built-in origin checking (§12.6) — no custom token system needed

### Planned
- Remove deprecated `src/data/` static files entirely
- Server-side MIME type / size validation on image uploads (currently client-only — see §12.7)
- Audit log viewer UI in the admin dashboard (data layer exists, no UI yet)
- Newsletter signup integration (Mailchimp or Resend)
- Contact form email delivery via Resend API
- Server action rate limiting — explicitly deferred during Phase 7, revisit if team grows (§12.7)
- Partners CRUD in admin dashboard (currently programs + opportunities only)
- Test coverage for Server Actions and admin components

### Known Debt
- Contact form logs to console only — needs email integration before launch
- No automated test coverage yet
- MUI bundle included but minimally used — evaluate removal
- `src/data/*.ts` files remain in the repo but are fully unused — safe to delete after confirming no remaining references
- `login_attempts` rows older than 24 hours are never purged automatically — harmless (queries only look at the last 15 minutes) but could be cleaned up via a scheduled job if the table grows large

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