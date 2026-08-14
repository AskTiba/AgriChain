# DECISIONS.md

| Date | Decision | Options Considered | Recommendation | Reasoning | Override Risk |
|------|----------|-------------------|----------------|-----------|---------------|
| 2026-08-15 | ORM choice | Prisma vs Drizzle | Drizzle ORM | Zero-overhead, compiles to pure SQL, no Rust binary engine, better perf for remote field devices | Lower ecosystem maturity than Prisma |
| 2026-08-15 | Package manager | npm vs yarn vs pnpm | pnpm | Content-addressable storage, faster installs, better workspace support | Slightly steeper learning curve |
| 2026-08-15 | Theme system | Two-mode (light/dark) vs Three-mode (light/dark/system) | Three-mode with system default | Respects OS preference per WCAG, allows manual override, persists choice | Slightly more complex state management |
| 2026-08-15 | Scaffold approach | Manual setup vs official example | Official `start-basic-react-query` example | Ensures version compatibility between all TanStack packages | Less control over initial file structure |
| 2026-08-15 | Git branching | Git Flow vs GitHub Flow | GitHub Flow | Simplified, short-lived feature branches, squash merge to main | Requires discipline to keep branches short-lived |
| 2026-08-15 | Scrum framework | Kanban vs Scrum | Scrum with 1-week sprints | Clear cadence, sprint goals, retrospective for continuous improvement | More ceremony than Kanban |
| 2026-08-15 | Estimation | T-shirt sizing vs Story Points | Fibonacci story points | Relative estimation, velocity tracking, better sprint planning | Requires team calibration |
