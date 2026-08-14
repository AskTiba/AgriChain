# Agri-Tech Cooperative & Supply Chain Tracker

## Project Overview
A commercial-grade agricultural logistics and supply chain coordination platform designed specifically for regional smallholder farming cooperatives and local distributors. This platform streamlines harvest logging, vehicle transport capacity mapping, and warehouse allocation.

## Architecture & Tech Stack
- **Framework:** [TanStack Start](https://tanstack.com/start/latest) (Full-stack React with SSR, streaming, and Server Functions)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (Type-safe nested routing, search parameter validation, prefetching)
- **State & Data:** [TanStack Query](https://tanstack.com/query/latest) (Asynchronous state sync, offline caching, optimistic updates)
- **Forms:** [TanStack Form](https://tanstack.com/form/latest) (Type-safe, field-level subscription rendering)
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens)
- **Database:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) (zero-overhead, type-safe SQL)
- **Package Manager:** pnpm
- **Build:** Vite + Vinxi

---

## High-Performance TanStack Integration Points

### 1. Offline-First Synchronization (TanStack Query)
- **The Challenge:** Farmers logging data from remote fields face unstable cellular coverage.
- **The Solution:** 
  - Utilize `PersistQueryClient` to cache mutation requests in browser storage (`indexedDB` or `localStorage`).
  - Implement **Optimistic Updates** on the harvest log list. When a farmer adds a new yield entry, the UI updates instantly with an "Uploading..." state.
  - Configure automatic background retries with exponential backoff so that mutations execute seamlessly once the connection is restored.

### 2. Fast-Loading Dashboard & Map Views (TanStack Start & Router)
- **The Challenge:** Interactive dashboards with logistics maps and heavy transport schedules can load slowly on lower-end devices.
- **The Solution:**
  - **SSR Hydration:** Use TanStack Start loader functions to fetch critical data (e.g., active distribution routes, warehouse capacities) on the server, ensuring an instantaneous first paint.
  - **Prefetching:** Configure Router links to prefetch target route loaders on hover. By the time a distributor clicks "Assign Driver", the next screen's data is already cached.

### 3. Dynamic Crop Allocation Form (TanStack Form)
- **The Challenge:** Co-op managers bulk-allocate complex harvests of varying weights, grades, and quality categories across multiple vehicles/warehouses.
- **The Solution:**
  - Utilize TanStack Form’s field-level subscription-based rendering. This ensures that typing a value in row #50 of a large dynamic grid doesn't trigger a re-render of the entire 100-row form.
  - Implement server-side validation using Server Functions inside the form's `validators` to verify warehouse capacity thresholds before submission.

---

## Feature Roadmap

### Milestone 1: Multi-Tenant Tenant Configuration & Onboarding
- [ ] Cooperative Profile setup (geographical location, main crop categories).
- [ ] Role-Based Access Control (Admin, Co-op Manager, Driver, Buyer).

### Milestone 2: Harvest Logging & Inventory Management
- [ ] Real-time yield logging form (Crop type, quality grade, quantity, field ID).
- [ ] Localized offline caching for remote field logging.
- [ ] Warehouse space visualization with real-time capacity meters.

### Milestone 3: Logistics & Transport Matchmaking
- [ ] Dynamic vehicle ledger (truck payload, active driver, target destination).
- [ ] Drag-and-drop shipment assignment linking harvests to transport vehicles.
- [ ] Shareable logistics manifest links using serialized URL search parameters.
