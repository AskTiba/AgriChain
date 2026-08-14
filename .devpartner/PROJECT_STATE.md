# PROJECT_STATE.md

## What Currently Works
- TanStack Start project scaffolded with React Query, Tailwind v4
- Root layout with sticky nav, theme toggle (light/dark/system), skip link, footer
- Dashboard page with stat cards and quick action cards
- Harvest logging page with offline status banner
- Logistics page with warehouse capacity cards and progress bars
- Design token system (CSS custom properties) for light/dark themes
- Global CSS with prefers-reduced-motion fallbacks, focus-visible rings

## In Progress
- Sprint 1: Multi-Tenant Configuration & Onboarding
  - PBI 1.1: Cooperative Profile Onboarding Setup
  - PBI 1.2: Adaptive Tenant Role & Dashboard Shell

## Blocked / Issues
- None currently

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
