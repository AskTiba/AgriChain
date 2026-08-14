# PROJECT_STATE.md

## What Currently Works
- TanStack Start project scaffolded with React Query, Tailwind v4
- Root layout with sticky nav, theme toggle (light/dark/system), skip link, footer
- Dashboard page with stat cards and quick action cards
- Harvest logging page with offline status banner
- Logistics page with warehouse capacity cards and progress bars
- Onboarding page with cooperative profile form (name + region inputs)
- Design token system (CSS custom properties) for light/dark themes
- Global CSS with prefers-reduced-motion fallbacks, focus-visible rings
- Onboarding wizard with 3 steps: Profile → Role → Review
- Role selector with 4 options (Admin, Co-op Manager, Driver, Buyer)
- Step-level validation with error banner and aria-invalid on fields
- Back navigation preserves form data
- Review step shows all data before submission
- Error states with retry for failed submissions
- Form reset after successful submission
- Git repo initialized
  - `330e396` feat: scaffold TanStack Start project with design tokens
  - `681861c` feat: add onboarding route with cooperative profile form
  - `92c116a` feat: add form validation with TanStack Form
  - `3722c9a` feat: add submit handler with success state and form reset
  - `dafe8b5` feat: add error states for failed profile submission
  - `da69d62` feat: add role selection to onboarding form
  - `9dc4056` feat: add onboarding wizard layout with step navigation

## In Progress
- Sprint 1: Multi-Tenant Configuration & Onboarding
  - Story: Cooperative Profile Setup [5 pts] ✓
  - Story: Role Selection [3 pts] ✓
  - Story: Onboarding Wizard Layout [5 pts] ✓

## Blocked / Issues
- ESLint not installed (tech debt, add next session)

## Key Architectural Facts
- **Framework:** TanStack Start (SSR + Server Functions)
- **Routing:** TanStack Router (file-based, type-safe)
- **State:** TanStack Query (async state, offline caching)
- **Forms:** TanStack Form (field-level subscriptions)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Database:** PostgreSQL + Drizzle ORM (not yet scaffolded)
- **Package Manager:** pnpm
- **Build:** Vite + Vinxi
- **Path alias:** `~/*` → `./src/*`

## Conventions
- Feature-first folder structure: `src/routes/`, `src/components/`, `src/features/`
- CSS tokens via custom properties, never hardcoded hex
- Touch targets ≥ 44px (Apple HIG)
- WCAG 2.2 Level AA compliance
- Fluid typography via `clamp()`
- Zero horizontal overflow at any viewport

## Environment Setup
- Node.js + pnpm
- `pnpm dev` starts dev server on localhost:3000
