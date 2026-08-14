# ERROR_LOG.md

| Date | Context | Symptom | Root Cause | Resolution | Prevention |
|------|---------|---------|------------|------------|------------|
| 2026-08-15 | Initial setup | `vinxi: not found` | Missing vinxi dependency | `pnpm add vinxi` | Check all peer deps after install |
| 2026-08-15 | Initial setup | `CONSTANTS` export missing | Version mismatch between TanStack packages | Used official scaffold with compatible versions | Use `create` CLI or official examples for version alignment |
| 2026-08-15 | Theme system | `window is not defined` on SSR | `resolveTheme()` called during server render | Guarded with `useState` + `useEffect`, default to 'light' on server | Always guard browser APIs in SSR contexts |
