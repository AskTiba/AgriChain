# Agri-Tech Cooperative & Supply Chain Tracker

A commercial-grade agricultural logistics and supply chain coordination platform for regional smallholder farming cooperatives and local distributors.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR + Server Functions) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| State | [TanStack Query](https://tanstack.com/query) (async state, offline caching) |
| Forms | [TanStack Form](https://tanstack.com/form) (field-level subscriptions) |
| Styling | Tailwind CSS v4 + CSS custom properties (design tokens) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint (flat config) |
| Package Manager | pnpm |
| Build | Vite + Vinxi |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Server runs at `http://localhost:3000`.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint check |
| `pnpm vitest run` | Run tests |

## Features

### Multi-Tenant Onboarding
- Cooperative profile setup (name, region, crop categories)
- Role-based access: Admin, Co-op Manager, Driver, Buyer
- 3-step wizard with validation

### Harvest Logging
- Real-time yield logging (crop type, quality grade, quantity, field ID)
- Harvest list with table display and empty states
- Grade A/B/C quality classification

### Warehouse & Inventory
- Warehouse capacity visualization with animated progress bars
- Color-coded status (low / medium / high capacity)

### Logistics & Transport
- Vehicle ledger with add form (payload, driver, destination)
- Shipment assignment (harvest-to-vehicle mapping)
- Shareable logistics manifests via base64-encoded URLs

### Buyer Portal
- Browse available harvests in card grid
- Place orders with quantity selection
- Order status tracking (pending → confirmed → delivered)

### Order Management
- Order list with status badges and action buttons
- Order detail view with harvest info and shipment link
- Order number slugs (`ORD-000001`) for clean URLs

### Offline Support
- TanStack Query PersistQueryClient for localStorage caching
- Seed data auto-restored on first visit
- Seed versioning to force refresh stale data

### Theme System
- Light, dark, and system modes
- Three-mode toggle with localStorage persistence
- WCAG AA contrast (≥ 4.5:1) in both modes

## Project Structure

```
src/
├── app/
│   ├── hooks/          # TanStack Query hooks (useHarvests, useOrders)
│   └── lib/            # API layer, seed data, utilities
├── components/
│   ├── ui/             # Reusable primitives (Input, Select, Button)
│   └── *.tsx           # Feature components (Wizard, WarehouseCapacity, etc.)
├── routes/
│   ├── __root.tsx      # Root layout (nav, theme, footer)
│   ├── index.tsx       # Dashboard
│   ├── harvest.tsx     # Harvest logging
│   ├── logistics.tsx   # Logistics & transport
│   ├── buyer.tsx       # Buyer portal
│   ├── onboarding.tsx  # Onboarding wizard
│   ├── manifest.tsx    # Public manifest view
│   └── orders/         # Order list + detail
├── styles/
│   └── app.css         # Design tokens, global styles
└── test/
    ├── setup.ts        # Test configuration
    └── test-utils.tsx  # Shared renderWithProviders
```

## Design System

- **Palette:** Agrarian Greens + Warm Neutrals (growth, trust, groundedness)
- **Tokens:** CSS custom properties (`--color-primary`, `--color-surface`, etc.)
- **Typography:** Fluid scale via `clamp()` (20-28px headings, 16px body)
- **Touch targets:** ≥ 44px (WCAG 2.5.8)
- **Accessibility:** Skip links, ARIA labels, `prefers-reduced-motion`, keyboard navigation

## Testing

108 tests across 22 test files covering:
- Component rendering and interaction
- Form validation and submission
- Integration tests for all core user journeys (buyer flow, order management, logistics)
- API layer (localStorage persistence)
- Data serialization (manifest encode/decode)

## Roadmap

- [x] Milestone 1: Multi-Tenant Configuration & Onboarding (13 pts)
- [x] Milestone 2: Harvest Logging & Inventory Management (13 pts)
- [x] Milestone 3: Logistics & Transport Matchmaking (13 pts)
- [x] Milestone 4: Buyer Portal & Order Management (8 pts)
- [x] Sprint 6: Tech Debt & QA Polish (7 pts)
- [x] Sprint 7: Integration Test Coverage (5 pts)
- [x] Sprint 8: Performance Optimization (3 pts)
- [ ] Route code splitting (createLazyFileRoute — deferred)
- [ ] Database scaffold (PostgreSQL + Drizzle ORM)
