<div align="center">

# AgriChain

**Agricultural logistics and supply chain coordination for cooperatives.**

Harvest tracking · Warehouse management · Fleet coordination · Order fulfillment

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-128%20passing-brightgreen.svg?style=flat-square)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-ef4444.svg?style=flat-square)](https://tanstack.com/start)

</div>

---

## What is AgriChain?

AgriChain is a full-stack web platform that connects every node in the agricultural supply chain — from field harvest to final delivery. Built for regional farming cooperatives and local distributors who need real-time visibility into their operations.

**The problem:** Cooperatives manage harvests, warehouses, vehicles, and buyer orders through disconnected spreadsheets, paper logs, and phone calls. This leads to wasted produce, missed deliveries, and lost revenue.

**The solution:** One platform that tracks the entire flow — harvest logging, warehouse capacity, fleet management, order fulfillment, and buyer communication — with offline support for field conditions.

---

## Core Features

| Module | What it does |
|--------|-------------|
| **Harvest Logging** | Record crop type, quality grade (A/B/C), quantity, and field ID in real-time |
| **Warehouse Tracking** | Monitor storage capacity with computed utilization across facilities |
| **Fleet Management** | Track vehicles (trucks, pickups, motorcycles) with payload capacity and status |
| **Shipment Assignment** | Link harvests to vehicles with driver and destination routing |
| **Buyer Portal** | Browse available harvests, place orders, track delivery status |
| **Order Fulfillment** | End-to-end workflow: pending → confirmed → in-transit → delivered |
| **Notifications** | Real-time alerts for order events (placed, confirmed, assigned, status change) |
| **Shareable Manifests** | Generate encoded URLs for logistics partners to view shipment details |

---

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│  Frontend                                           │
│  TanStack Start (SSR) · TanStack Router · Query     │
│  Tailwind CSS v4 · CSS custom properties            │
├─────────────────────────────────────────────────────┤
│  Backend                                            │
│  TanStack Server Functions · Zod validation         │
│  Auth middleware · Session cookies (bcrypt)         │
├─────────────────────────────────────────────────────┤
│  Database                                           │
│  PostgreSQL (Supabase) · Drizzle ORM · pg TCP       │
├─────────────────────────────────────────────────────┤
│  Tooling                                            │
│  TypeScript · Vitest · ESLint · pnpm · Vite + Vinxi │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Clone
git clone git@github.com:AskTiba/AgriChain.git
cd AgriChain

# Install
pnpm install

# Configure
cp .env.example .env
# Edit .env → set DATABASE_URL and SESSION_SECRET

# Database
npx tsx scripts/seed.ts    # Populate test data

# Run
pnpm dev                   # http://localhost:3000
```

**Test credentials:** All accounts use password `password123`

| Role | Email |
|------|-------|
| Admin | admin@coop.com |
| Manager | manager@greenvalley.com |
| Driver | driver1@greenvalley.com |
| Buyer | buyer1@greenvalley.com |

---

## Architecture

```
src/
├── app/
│   ├── db/              # Drizzle schema + lazy PostgreSQL connection
│   ├── hooks/           # TanStack Query hooks (useHarvests, useOrders, etc.)
│   └── server/          # Server functions with auth middleware
│       ├── auth.ts      # Register, login, logout, getCurrentUser
│       ├── auth-resilience.ts  # Session fallback on DB failure
│       ├── harvests.ts  # Harvest CRUD
│       ├── orders.ts    # Order CRUD + fulfillment
│       ├── warehouses.ts # Warehouse CRUD + capacity
│       └── ...
├── components/
│   ├── ui/              # Reusable primitives (Input, Select, Button)
│   └── *-page.tsx       # Feature components (one per route)
├── routes/
│   ├── __root.tsx       # Root layout (nav, theme, notifications)
│   ├── _protected.tsx   # Auth guard (redirects to /login)
│   └── _protected/      # Protected pages
├── styles/
│   └── app.css          # Design tokens + dark mode
└── test/
    ├── setup.ts         # Vitest config
    └── test-utils.tsx   # renderWithProviders
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| ORM | Drizzle | Zero-overhead, compiles to pure SQL, no binary engine |
| Auth | Session cookies | Stateless, works with SSR, no JWT complexity |
| State | TanStack Query | Server state management with offline caching |
| Styling | Tailwind + CSS tokens | Design system without runtime cost |
| Database | Supabase (pg TCP) | Free tier, no cold starts, reliable connection |

---

## Database Schema

```
┌──────────────────┐     ┌──────────────────┐
│      users       │     │  cooperatives    │
├──────────────────┤     ├──────────────────┤
│ id (uuid, PK)    │     │ id (uuid, PK)    │
│ email (unique)   │◄────│ name             │
│ name             │     │ location         │
│ password_hash    │     │ created_by       │
│ role (enum)      │     └──────────────────┘
│ cooperative_id ──┘
└──────────────────┘
        │
        ▼
┌──────────────────┐     ┌──────────────────┐
│ harvest_entries  │     │   warehouses     │
├──────────────────┤     ├──────────────────┤
│ id (uuid, PK)    │     │ id (uuid, PK)    │
│ crop_type        │     │ name             │
│ quality_grade    │     │ location         │
│ quantity         │     │ total_capacity_kg│
│ field_id         │     │ cooperative_id   │
│ created_by ──────┘     └──────────────────┘
│ warehouse_id ──────────┘
└──────────────────┘
        │
        ▼
┌──────────────────┐     ┌──────────────────┐
│     orders       │     │    vehicles      │
├──────────────────┤     ├──────────────────┤
│ id (uuid, PK)    │     │ id (uuid, PK)    │
│ order_number     │     │ name             │
│ harvest_id ──────┘     │ type (enum)      │
│ buyer_id ────────┘     │ plate_number     │
│ quantity         │     │ payload_capacity │
│ status (enum)    │     │ status (enum)    │
│ confirmed_by     │     └──────────────────┘
│ assigned_driver  │
└──────────────────┘
        │
        ▼
┌──────────────────┐     ┌──────────────────┐
│  notifications   │     │   assignments    │
├──────────────────┤     ├──────────────────┤
│ id (uuid, PK)    │     │ id (uuid, PK)    │
│ user_id          │     │ harvest_id       │
│ type (enum)      │     │ vehicle_id       │
│ message          │     │ driver_name      │
│ order_id         │     │ destination      │
│ read             │     └──────────────────┘
│ created_at       │
└──────────────────┘
```

---

## Testing

```bash
pnpm vitest run                    # Run all tests
pnpm vitest run --reporter=verbose # Detailed output
```

**128 tests** across 24 test files:

| Layer | What's tested |
|-------|--------------|
| Server logic | Auth resilience, warehouse service, order fulfillment |
| Hooks | All TanStack Query hooks with mocked server functions |
| Components | Rendering, interaction, form validation |
| Integration | Buyer flow, order management, logistics, onboarding |

---

## Design System

**Palette:** Agrarian Greens + Warm Neutrals
- Primary: `#1E5E3A` (light) / `#2E8F59` (dark)
- Background: Warm cream (`#FBF8F1`)
- 60-30-10 color split

**Typography:** Fluid scale via `clamp()`
- Headings: 20-28px
- Body: 16px
- Contrast: ≥ 4.5:1 (WCAG AA)

**Components:** Touch targets ≥ 44px, keyboard navigation, screen-reader labels

---

## Roadmap

### Completed
- [x] Multi-tenant cooperative onboarding
- [x] Harvest logging with quality grading
- [x] Warehouse capacity tracking
- [x] Vehicle fleet management
- [x] Shipment assignment and manifests
- [x] Buyer portal with order placement
- [x] Order fulfillment workflow
- [x] Notification system
- [x] Auth with role-based access control
- [x] Auth resilience (session fallback on DB failure)

### Planned
- [ ] Real-time GPS tracking for shipments
- [ ] Mobile app (React Native)
- [ ] AI-powered demand forecasting
- [ ] Data marketplace for cooperative analytics
- [ ] Route code splitting (createLazyFileRoute)
- [ ] Google OAuth integration

---

## License

Copyright 2026 AgriChain Contributors

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

Commercial licensing available for organizations requiring proprietary deployment.

---

<div align="center">

**Built with care for the cooperatives that feed communities.**

</div>
