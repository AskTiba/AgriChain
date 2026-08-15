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
- Vehicle ledger with table and add vehicle form
- Shipment assignment with vehicle selection and harvest mapping
- Shareable logistics manifests with base64 URL encoding and read-only view
- Offline caching with TanStack Query PersistQueryClient (localStorage)
- Premium UI components (Select, Input) with macOS native styling
- Design token system (CSS custom properties) for light/dark themes
- Global CSS with prefers-reduced-motion fallbacks, focus-visible rings
- Buyer portal with harvest browsing, order placement, and order status tracking
- Order IDs use `orderNumber` slug (`ORD-000001`) for URLs and display
- Order detail view with harvest info, status badges, and shipment link
- Responsive navbar with mobile hamburger menu, desktop horizontal links
- Seed data with UUIDs for `id` and sequential `orderNumber` slugs
- Seed versioning (`agri-tech-seed-version`) to force refresh old data
- Git repo initialized
  - `330e396` feat: scaffold TanStack Start project with design tokens
  - `681861c` feat: add onboarding route with cooperative profile form
  - `92c116a` feat: add form validation with TanStack Form
  - `3722c9a` feat: add submit handler with success state and form reset
  - `dafe8b5` feat: add error states for failed profile submission
  - `da69d62` feat: add role selection to onboarding form
  - `9dc4056` feat: add onboarding wizard layout with step navigation
  - `a205dd3` feat: add harvest log form with validation and submit handler
  - `6f6f020` feat: add harvest log list with table display
  - `18dbd33` feat: add warehouse capacity visualization with animated meters
  - `48328c6` feat: add vehicle ledger with table and add form
  - `2af8245` feat: add shipment assignment with vehicle selection and harvest mapping
  - `ebe2fc0` feat: add shareable manifests with base64 URL encoding and read-only view
  - `234de78` feat: redesign Select and Input to macOS native pop-up button style
  - `c3435cb` feat: add buyer portal with harvest browsing and order management
  - `786f5c6` feat: add reusable Select and Input components with custom chevron
  - `e44ee5e` feat: fix responsive navbar, theme toggle, and seed data with proper UUIDs

## In Progress
- Sprint 5: Buyer Portal & Order Management
  - Story: Buyer Harvest Browsing [3 pts]
  - Story: Order Placement [3 pts]
  - Story: Order List with Status Tracking [2 pts]

## Blocked / Issues
- ESLint not installed (tech debt)

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
