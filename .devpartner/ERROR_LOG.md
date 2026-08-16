# Error Log

## Sprint 12 — Order Fulfillment Workflow

### 2026-08-16: Neon HTTP driver fails on Node.js v24
- **Symptom:** `neon()` from `@neondatabase/serverless` throws `ETIMEDOUT` / `fetch failed`
- **Root cause:** Node.js v24's native `fetch` cannot reach Neon's HTTP endpoint (TCP works fine)
- **Fix:** Rewrote `scripts/migrate-order-fulfillment.ts` to use `pg` (TCP driver) instead of `neon()` HTTP
- **Lesson:** Always have a TCP fallback for DB operations; don't assume HTTP fetch works in all Node versions

### 2026-08-16: drizzle-kit push fails on buyer_id text→uuid cast
- **Symptom:** `column "buyer_id" cannot be cast automatically to type uuid`
- **Root cause:** PostgreSQL can't auto-cast `text` → `uuid` with existing data
- **Fix:** Manual migration with `DROP NOT NULL` → clean non-UUID rows → `TYPE uuid USING buyer_id::uuid` → `SET NOT NULL`
- **Lesson:** Schema type changes on populated tables always need manual migration scripts

### 2026-08-16: drizzle-kit push stuck on "Pulling schema from database"
- **Symptom:** Spinner hangs for minutes before completing
- **Root cause:** drizzle-kit uses `@neondatabase/serverless` which tries WebSocket; slow negotiation over pooler
- **Fix:** Install `ws` package for proper WebSocket support; accept slow pull as normal for Neon pooler
- **Lesson:** Neon pooler connections are inherently slower; factor into CI/CD timeouts

---

## Sprint 11 — Authentication

### 2026-08-16: addOrder exposed buyerId from client input (security)
- **Symptom:** Any user could place orders as any buyer
- **Root cause:** `buyerId` was accepted from client-side form data
- **Fix:** `buyerId` now read from `context.session.userId` in server function; removed from client input
- **Lesson:** Never trust client-sourced identity fields; always derive from session

---

## General

### 2026-08-15: SSR hydration mismatch on dark mode
- **Symptom:** Flash of wrong theme on page load
- **Root cause:** Theme applied client-side after SSR renders default
- **Fix:** Inline `<script>` in `__root.tsx` reads `localStorage` before paint
- **Lesson:** Theme must be applied synchronously before first paint
