# Youth Access Hub

**Empowering Youth, Opening Opportunities**

Youth Access Hub is a Zimbabwe-based intermediary organisation that connects young people to mentorship programs, career opportunities, internships, funding, and a network of partner organisations. This repository contains the official YAH website — a Next.js informational/marketing platform serving as the digital front door for the organisation.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Branch & Contribution Guidelines](#branch--contribution-guidelines)
- [Roadmap](#roadmap)
- [Licence](#licence)

---

## Project Overview

The YAH website showcases the organisation's core offerings:

- **Mentorship Programs** — structured programs pairing youth with experienced professionals
- **Growth Opportunities** — internships, funding, training, scholarships, and volunteering
- **Partner Network** — schools, universities, corporates, NGOs, and government bodies
- **Get Connected** — a contact and referral entry point for youth and partners

The site is built for performance and accessibility, statically generated at build time, and designed to be maintained by non-technical staff through a headless CMS integration in a future phase.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling (primary) | Tailwind CSS | 4.x |
| Styling (complex UI) | MUI + Emotion | v9 |
| Fonts | Poppins + Inter | via next/font |
| Data (Phase 1) | Typed TypeScript files | — |
| Data (Phase 2+) | Sanity.io CMS | planned |
| Deployment | Vercel | — |

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kunchikuni/Youth-Access-Hub.git
cd Youth-Access-Hub

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values (none required for Phase 1)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
youth-access-hub/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout — fonts, metadata, nav, footer
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── programs/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── opportunities/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── partners/page.tsx
│   │   ├── contact/page.tsx
│   │   └── api/contact/route.ts      # Contact form handler
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer
│   │   ├── ui/                       # Atomic components: Button, Card, Badge, SectionHeading
│   │   ├── sections/                 # Page-level sections: Hero, StatsBar, HowItWorks, etc.
│   │   └── forms/                    # ContactForm
│   │
│   ├── data/                         # Phase 1 static content (programs, opportunities, partners)
│   ├── lib/                          # getData.ts (data abstraction), utils.ts
│   ├── types/                        # TypeScript interfaces: Program, Opportunity, Partner
│   └── styles/
│       └── globals.css               # Tailwind v4 entry + YAH design tokens
│
├── public/
│   └── images/                       # Logo, mentor photos, partner logos
│
├── ARCHITECTURE.md                   # Living architecture document
├── AGENTS.md                         # AI agent instructions
└── CLAUDE.md                         # Claude-specific coding instructions
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

---

## Environment Variables

Copy `.env.example` to `.env.local` before running the project. **Never commit `.env.local`.**

```bash
# Phase 1 — no environment variables required

# Phase 2+ (Sanity CMS — add when migrating data layer)
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_TOKEN=

# Phase 2+ (Email — contact form delivery)
RESEND_API_KEY=
CONTACT_EMAIL_TO=
```

---

## Branch & Contribution Guidelines

This project follows a structured branching workflow:

- **`main`** — production branch. Never commit directly to main.
- **`feat/<name>`** — for new features or pages (e.g. `feat/contact-page`)
- **`fix/<name>`** — for bug fixes (e.g. `fix/navbar-mobile-scroll`)
- **`content/<name>`** — for content-only updates (e.g. `content/update-programs`)

### Workflow

```bash
# 1. Always branch from main
git checkout main && git pull
git checkout -b feat/your-feature-name

# 2. Make your changes, commit with a descriptive message
git add .
git commit -m "feat: add opportunities listing page"

# 3. Push and open a Pull Request → main
git push origin feat/your-feature-name
```

Pull requests require at least one review before merging.

### Commit Message Format

```
type: short description

Types: feat | fix | content | refactor | docs | style | chore
```

---

## Architecture

Full architectural decisions, design tokens, data layer design, component hierarchy, and the technology roadmap are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Key architectural rules:**
- All data access goes through `src/lib/getData.ts` — never import from `src/data/` directly in components
- No component fetches its own data — pages fetch and pass as props
- Tailwind v4 is the primary styling system — no `tailwind.config.js` exists by design
- The `@/` path alias maps to `src/` — configured in `tsconfig.json`

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation — types, data layer, design tokens | ✅ Complete |
| 2 | Layout Shell — Navbar, Footer, root layout | ✅ Complete |
| 3 | UI Atoms — Button, Card, Badge, SectionHeading | ✅ Complete |
| 4 | Home Page — Hero, StatsBar, HowItWorks, Programs, CTA | ✅ Complete |
| 5 | Inner Pages — Programs, Opportunities, Partners, About, Contact | 🔄 In Progress |
| 6 | API & Forms — Contact form with email delivery | ⏳ Planned |
| 7 | CMS Migration — Sanity.io data layer | ⏳ Planned |
| 8 | Quality Gate — Tests, strict lint, accessibility audit | ⏳ Planned |
| 9 | Deployment — Vercel + GitHub Actions CI | ⏳ Planned |

---

## Licence

© 2026 Youth Access Hub. All rights reserved.

This codebase is proprietary. Unauthorised copying, distribution, or modification outside of the Youth Access Hub organisation is not permitted.

---

*Built with purpose. Empowering Youth, Opening Opportunities.*
