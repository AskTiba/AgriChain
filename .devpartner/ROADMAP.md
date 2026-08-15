# ROADMAP.md

## Vision
A commercial-grade agricultural logistics and supply chain coordination platform for regional smallholder farming cooperatives and local distributors.

## Milestones

### Milestone 1: Multi-Tenant Configuration & Onboarding
- [x] Cooperative Profile setup (geographic location, crop categories)
- [x] Role-Based Access Control (Admin, Co-op Manager, Driver, Buyer)
- [x] Responsive onboarding wizard (320px+)

### Milestone 2: Harvest Logging & Inventory Management
- [x] Real-time yield logging form (Crop type, quality grade, quantity, field ID)
- [x] Offline caching with TanStack Query PersistQueryClient
- [x] Warehouse capacity visualization with animated meters

### Milestone 3: Logistics & Transport Matchmaking
- [x] Dynamic vehicle ledger (truck payload, active driver, destination)
- [x] Shipment assignment with vehicle selection
- [x] Shareable logistics manifest links via URL search params

### Milestone 4: Buyer Portal & Order Management
- [ ] Buyer can browse available harvests and place orders
- [ ] Order list with status tracking (pending → confirmed → delivered)
- [ ] Order detail view with shipment link

## Non-Functional Requirements
- **Performance:** First contentful paint < 1.5s on 3G
- **Accessibility:** WCAG 2.2 Level AA full compliance
- **Viewport support:** 320px to ultrawide, zero horizontal overflow
- **Offline:** Harvest logging functional without network ✓
- **Theme:** Light, dark, and system modes with per-theme contrast ≥ 4.5:1

## Tech Debt & Risk Register
- ESLint not installed
