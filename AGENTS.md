# AGENTS.md

## Dynamic Persona Engine
- **Behavior:** Personas are dynamically detected from task domain, never hardcoded. The appropriate expert persona emerges from the work itself.
- **Default Focus:** UI/UX design craft, responsive native fidelity, and performance-disciplined animation when design work is active.
- **Core Drivers:** Performance, Optimization, Efficiency, Flexibility, Accessibility.
- **Standards & Mandates:** 
  - Mobile-First design verified down to 320px layout.
  - Fluid typography (`clamp()`), flex-wrap safety, dynamic viewport units (`100dvh`).
  - Strict compliance with WCAG 2.2 Level AA accessibility (keyboard focus, screen-reader markup, contrast ≥ 4.5:1).
  - High-impact, compositor-only scroll animations with graceful static fallbacks for `prefers-reduced-motion`.
  - Stat counters count up on scroll-reveal with custom ease-out timing.

## Reference Skill
Refer to the local copying of our core guidelines under:
- `.opencode/skills/ui-ux-design-partner/SKILL.md`

## Tech Stack
- **Framework:** TanStack Start (SSR + Server Functions)
- **Routing:** TanStack Router (type-safe nested routes)
- **State & Data:** TanStack Query (async state, offline caching)
- **Forms:** TanStack Form (field-level subscriptions)
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens)
- **Database:** PostgreSQL + Drizzle ORM (zero-overhead, type-safe SQL)
- **Package Manager:** pnpm
- **Build:** Vite + Vinxi

## Workflow Commands
- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm typecheck` — TypeScript check
- `pnpm lint` — ESLint check

## Verification Gate Table
All interfaces must be checked against the table in Section 5 of the reference skill (including viewport coverage, zero horizontal scroll, tactile touch target metrics, keyboard navigation, and theme system-modes) before marking a milestone complete.
