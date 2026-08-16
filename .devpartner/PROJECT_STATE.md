# PROJECT_STATE.md

## What Currently Works
- TanStack Start project scaffolded with React Query, Tailwind v4
- Root layout with sticky nav, theme toggle (light/dark/system), skip link, footer
- Dashboard page with stat cards and quick action cards
- Onboarding wizard with 3 steps: Profile → Role → Review
- Role selector with 4 options (Admin, Co-op Manager, Driver, Buyer)
- Harvest log form with crop type, quality grade, quantity, field ID
- Harvest log list with table display and empty state
- Warehouse capacity visualization with animated meters and color-coded status
- Vehicle ledger with table and add vehicle form (DB-backed)
- Shipment assignment with inline per-harvest assignment flow (DB-backed)
- Shareable logistics manifests with base64 URL encoding and read-only view
- Offline caching with TanStack Query PersistQueryClient (localStorage)
- Premium UI components (Select, Input) with macOS native styling
- Design token system (CSS custom properties) for light/dark themes
- Global CSS with prefers-reduced-motion fallbacks, focus-visible rings
- Buyer portal with harvest browsing, order placement, and order status tracking
- Order IDs use `orderNumber` slug (`ORD-000001`) for URLs and display
- Order detail view with harvest info, status badges, and shipment link
- Responsive navbar with mobile hamburger menu, desktop horizontal links
- PostgreSQL via Neon (Frankfurt `eu-central-1`), Drizzle ORM
- Database schema: harvestEntries, orders, vehicles (fleet assets), assignments (trip records)
- Server functions for all CRUD via TanStack `createServerFn` with Zod validation
- Hooks with SSR guards (`enabled: typeof window !== 'undefined'`)
- ESLint flat config (`eslint.config.mjs`)
- Git repo initialized

## In Progress
- (none)

## Blocked / Issues
- (none)

## Key Architectural Facts
- **Framework:** TanStack Start (SSR + Server Functions)
- **Routing:** TanStack Router (file-based, type-safe)
- **State:** TanStack Query (async state, offline caching)
- **Forms:** TanStack Form (field-level subscriptions)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Database:** PostgreSQL via Neon + Drizzle ORM (lazy `getDb()` connection)
- **Linting:** ESLint (flat config, `eslint.config.mjs`)
- **Testing:** Vitest + React Testing Library (99 tests, 21 files)
- **Theme:** Light/dark/system with WCAG AA contrast ≥ 4.5:1
- **Package Manager:** pnpm
- **Build:** Vite + Vinxi
- **Path alias:** `~/*` → `./src/*`

## Conventions
- Feature-first folder structure: `src/routes/`, `src/components/`, `src/app/hooks/`
- Server functions in `src/app/server/` with Zod validation
- CSS tokens via custom properties, never hardcoded hex
- Touch targets ≥ 44px (Apple HIG)
- WCAG 2.2 Level AA compliance
- Fluid typography via `clamp()`
- Zero horizontal overflow at any viewport
- Git: conventional commits, GitHub Flow, commit requires explicit user approval

## Environment Setup
- Node.js + pnpm
- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm typecheck` — TypeScript check
- `pnpm lint` — ESLint check
- `pnpm vitest run` — Run tests
