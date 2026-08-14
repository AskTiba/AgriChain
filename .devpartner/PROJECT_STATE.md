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
- Git repo initialized
  - `330e396` feat: scaffold TanStack Start project with design tokens
  - `681861c` feat: add onboarding route with cooperative profile form
  - `92c116a` feat: add form validation with TanStack Form
  - `3722c9a` feat: add submit handler with success state and form reset

## In Progress
- Sprint 1: Multi-Tenant Configuration & Onboarding
  - Story: Cooperative Profile Setup [5 pts]
    - Unit 1: Route structure + test ✓ (done)
    - Unit 2: Form validation + test ✓ (done)
    - Unit 3: Submit handler + test ✓ (done)
    - Unit 4: Success/error states + test
  - Story: Role Selection [3 pts]
  - Story: Onboarding Wizard Layout [5 pts]

## Blocked / Issues
- ESLint not installed (tech debt, add next session)
- No test files yet (test-first workflow starts with first feature)

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
