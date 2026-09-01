# AgriChain — Roadmap

## Backlog

Items scheduled for future sprints. Organized by priority.

### High Priority

| # | Feature | Description | Sprint |
|---|---------|-------------|--------|
| 1 | **Audit logging** | Track all sensitive operations (role changes, order mutations, user deletions) with timestamp, user, action, and affected record | ✅ Sprint 16 |
| 2 | **Cooperative data isolation** | Server-side filtering by `cooperative_id` on all queries — users only see their cooperative's data | ✅ Sprint 16 |
| 3 | **Rate limiting** | Protect login/register endpoints from brute-force attacks (e.g. 5 attempts per minute per IP) | ✅ Sprint 16 |
| 4 | **CSRF tokens** | Add explicit CSRF protection for state-changing operations beyond SameSite cookie | ✅ Sprint 16 |

### Medium Priority

| # | Feature | Description | Sprint |
|---|---------|-------------|--------|
| 5 | **Email invite delivery** | Send invite links via email instead of manual copying/sharing | TBD |
| 6 | **Password reset** | Self-service password recovery via email token | TBD |
| 7 | **Email verification** | Verify email ownership on registration before allowing login | TBD |
| 8 | **Session management** | View active sessions, revoke specific or all sessions | TBD |

### Low Priority

| # | Feature | Description | Sprint |
|---|---------|-------------|--------|
| 9 | **Role change panel** | Admin UI to change existing user roles without re-inviting | TBD |
| 10 | **Two-factor authentication** | Optional 2FA for admin/manager accounts | TBD |
| 11 | **Export data** | CSV/PDF export for orders, harvests, reports | TBD |
| 12 | **Bulk operations** | Bulk confirm orders, bulk assign drivers | TBD |

---

## Completed Sprints

| Sprint | Features | Status |
|--------|----------|--------|
| 1-8 | Core features (harvest, orders, logistics, auth, cooperatives, warehouses) | ✅ Done |
| 9 | Database scaffold + component extraction | ✅ Done |
| 10 | Vehicle & assignment data model | ✅ Done |
| 11 | Authentication & authorization | ✅ Done |
| 12 | Order fulfillment + notifications | ✅ Done |
| 13 | Vercel deployment config | ✅ Done |
| 14 | Delete account + idempotent seed | ✅ Done |
| 15 | RBAC + invitation system | ✅ Done |
| 16 | Security hardening (audit, rate limit, CSRF, isolation) | ✅ Done |

---

## Notes

- Items marked "TBD" need sprint planning before implementation
- High priority items should be addressed before production deployment
- Medium priority items enhance security and user experience
- Low priority items are quality-of-life improvements
