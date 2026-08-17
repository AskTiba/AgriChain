# AgriChain — Role-Based Access Control (RBAC)

## Overview

AgriChain uses a **role-based access control** system to ensure users can only perform actions appropriate to their role. The system enforces permissions **server-side** — the UI hides buttons, but the server rejects unauthorized requests regardless.

**Core principle:** Registration is open to buyers only. All other roles (Admin, Manager, Driver) require an **invitation** from an existing admin or manager.

---

## Roles

| Role | Description | How to Obtain |
|------|-------------|---------------|
| **Buyer** | Can browse harvests, place orders, view own order status | Self-register at `/register` |
| **Driver** | Can view assigned deliveries, mark orders in-transit/delivered | Invite only (`/invites`) |
| **Manager** | Can confirm orders, assign drivers, manage harvests/warehouses | Invite only (`/invites`) |
| **Admin** | Full system access including user management and deletions | Seed script only (initial), then invite only |

---

## Permission Matrix

### Order Management

| Action | Buyer | Driver | Manager | Admin |
|--------|:-----:|:------:|:-------:|:-----:|
| Place order | ✅ | ❌ | ❌ | ❌ |
| View own orders | ✅ | ❌ | ❌ | ❌ |
| View all orders | ❌ | ❌ | ✅ | ✅ |
| Confirm pending order | ❌ | ❌ | ✅ | ✅ |
| Assign driver to order | ❌ | ❌ | ✅ | ✅ |
| Mark order in-transit | ❌ | ✅ | ✅ | ✅ |
| Mark order delivered | ❌ | ✅ | ✅ | ✅ |
| Delete order | ❌ | ❌ | ❌ | ✅ |

### Harvest Management

| Action | Buyer | Driver | Manager | Admin |
|--------|:-----:|:------:|:-------:|:-----:|
| View harvests | ✅ | ✅ | ✅ | ✅ |
| Create harvest entry | ❌ | ❌ | ✅ | ✅ |
| Delete harvest entry | ❌ | ❌ | ❌ | ✅ |

### Fleet & Logistics

| Action | Buyer | Driver | Manager | Admin |
|--------|:-----:|:------:|:-------:|:-----:|
| View vehicles | ✅ | ✅ | ✅ | ✅ |
| Add vehicle | ❌ | ❌ | ✅ | ✅ |
| Update vehicle status | ❌ | ❌ | ✅ | ✅ |
| Delete vehicle | ❌ | ❌ | ❌ | ✅ |
| Create assignment | ❌ | ❌ | ✅ | ✅ |
| Delete assignment | ❌ | ❌ | ❌ | ✅ |
| View warehouses | ✅ | ✅ | ✅ | ✅ |
| Add warehouse | ❌ | ❌ | ✅ | ✅ |
| Assign harvest to warehouse | ❌ | ❌ | ✅ | ✅ |

### Cooperative & User Management

| Action | Buyer | Driver | Manager | Admin |
|--------|:-----:|:------:|:-------:|:-----:|
| View cooperatives | ✅ | ✅ | ✅ | ✅ |
| Create cooperative | ❌ | ❌ | ❌ | ✅ |
| Assign user to cooperative | ❌ | ❌ | ✅ | ✅ |
| Create invite | ❌ | ❌ | ✅ | ✅ |
| Revoke invite | ❌ | ❌ | ✅ | ✅ |
| Delete account (self) | ✅ | ✅ | ✅ | ✅ |

### Notifications

| Action | Buyer | Driver | Manager | Admin |
|--------|:-----:|:------:|:-------:|:-----:|
| View notifications | ✅ | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ | ✅ |
| Mark all as read | ✅ | ✅ | ✅ | ✅ |

---

## Registration & Invitation Flow

### Public Registration (Buyer Only)

```
User visits /register
        │
        ▼
Fills name, email, password
(no role selection)
        │
        ▼
Server creates user with role = 'buyer'
        │
        ▼
Session created, redirect to /
```

### Invitation Flow (Driver, Manager, Admin)

```
Admin/Manager visits /invites
        │
        ▼
Enters email + selects role
        │
        ▼
Server creates invite record
  - token: random UUID
  - expiresAt: now + 7 days
  - usedAt: null
        │
        ▼
Admin copies invite link:
  https://yourdomain.com/invite/{token}
        │
        ▼
Admin shares link with new user
        │
        ▼
User visits /invite/{token}
        │
        ▼
Page validates token:
  ✓ Token exists
  ✓ Not already used
  ✓ Not expired (7 days)
  ✓ Email matches
        │
        ▼
User fills name, password
(email pre-filled, disabled)
        │
        ▼
Server creates user with:
  - role from invite
  - cooperativeId from invite
  - invite marked as used
        │
        ▼
Session created, redirect to /
```

---

## Server-Side Enforcement

### The `requireRole` Middleware

Every protected mutation uses the `requireRole` middleware:

```typescript
// From src/app/server/auth-middleware.ts

export function requireRole(allowedRoles: UserRole[]) {
  return createMiddleware({ type: 'function' }).server(
    async ({ next }) => {
      const session = await useAppSession()
      const data = session.data

      if (!data.userId) {
        throw new Error('Unauthorized')
      }

      if (!data.role || !allowedRoles.includes(data.role as UserRole)) {
        throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
      }

      return next({
        context: {
          session: {
            userId: data.userId!,
            email: data.email!,
            name: data.name!,
            role: data.role!,
          },
        },
      })
    },
  )
}
```

### How Mutations Use It

```typescript
// Example: Only managers and admins can confirm orders
export const confirmOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])  // <-- RBAC enforced here
  .handler(async ({ data, context }) => {
    // ... database logic
  })
```

### What Happens When Access Is Denied

1. Middleware throws `Error: Access denied. Required role: admin or manager`
2. TanStack Start catches the error
3. Client receives error response
4. UI shows error message to user
5. **No database changes occur**

---

## Database Schema

### `users` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique user identifier |
| `email` | varchar(255) | NOT NULL, UNIQUE | Login email |
| `name` | varchar(255) | NOT NULL | Display name |
| `password_hash` | text | NOT NULL | Bcrypt hash (12 rounds) |
| `role` | text | NOT NULL, DEFAULT 'buyer' | One of: admin, manager, driver, buyer |
| `cooperative_id` | uuid | FK → cooperatives(id) | Associated cooperative |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Account creation time |

### `invites` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique invite identifier |
| `email` | varchar(255) | NOT NULL | Invited email address |
| `role` | text | NOT NULL | Role to assign on registration |
| `cooperative_id` | uuid | FK → cooperatives(id) | Cooperative to join |
| `token` | uuid | NOT NULL, UNIQUE | Invite link token |
| `created_by` | uuid | NOT NULL, FK → users(id) | Who created the invite |
| `used_at` | timestamptz | NULLABLE | When invite was consumed |
| `expires_at` | timestamptz | NOT NULL | Expiration time (7 days) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Invite creation time |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/server/auth-middleware.ts` | `authMiddleware` + `requireRole()` helper |
| `src/app/server/auth.ts` | `register` (buyer), `inviteRegister`, `login`, `logout`, `deleteAccount` |
| `src/app/server/invites.ts` | `createInvite`, `validateInvite`, `consumeInvite`, `fetchInvites`, `deleteInvite` |
| `src/app/server/orders.ts` | Order mutations with RBAC middleware |
| `src/app/server/harvests.ts` | Harvest mutations with RBAC middleware |
| `src/app/server/vehicles.ts` | Vehicle mutations with RBAC middleware |
| `src/app/server/assignments.ts` | Assignment mutations with RBAC middleware |
| `src/app/server/warehouses.ts` | Warehouse mutations with RBAC middleware |
| `src/app/server/cooperatives.ts` | Cooperative mutations with RBAC middleware |
| `src/app/hooks/use-invites.ts` | React Query hooks for invite operations |
| `src/components/invites-page.tsx` | Admin/manager invite management UI |
| `src/components/invite-register-page.tsx` | Invite-based registration page |
| `src/components/register-page.tsx` | Public registration (buyer only) |
| `scripts/migrate-invites.ts` | Database migration for invites table |

---

## Seed Script

The seed script creates test users via **direct database access** (bypassing the registration API):

| Email | Role | Password | Notes |
|-------|------|----------|-------|
| `admin@coop.com` | admin | `password123` | Platform administrator |
| `manager@greenvalley.com` | manager | `password123` | Green Valley manager |
| `manager2@greenvalley.com` | manager | `password123` | Green Valley foreman |
| `driver1@greenvalley.com` | driver | `password123` | Green Valley driver |
| `driver2@greenvalley.com` | driver | `password123` | Green Valley driver |
| `buyer1@greenvalley.com` | buyer | `password123` | Green Valley buyer |
| `buyer2@greenvalley.com` | buyer | `password123` | Green Valley buyer |
| `unassigned@test.com` | buyer | `password123` | No cooperative |

```bash
# Seed with fresh data (wipes existing)
pnpm db:seed --reset

# Seed only if empty (safe for production)
pnpm db:seed
```

**Important:** The seed script is the **only way** to create an admin user directly. In production, admins should be created via the seed script, then use the invite system for all other roles.

---

## Migration Scripts

Run these before deploying:

```bash
# Create invites table
npx tsx scripts/migrate-invites.ts

# Make orders.buyer_id nullable (for account deletion)
npx tsx scripts/migrate-delete-account.ts
```

---

## Security Considerations

### What's Protected

- **Server-side enforcement:** Every mutation checks the user's role before executing
- **Session-based auth:** Roles are stored in signed HTTP-only cookies
- **Invite-only roles:** Driver, Manager, Admin cannot self-register
- **Single-use invites:** Each invite can only be consumed once
- **Time-limited invites:** Invites expire after 7 days
- **Email matching:** Invite registration requires matching email address

### What's NOT Protected (Limitations)

- **No rate limiting:** Brute-force attacks on login are possible
- **No CSRF protection:** SameSite=Lax cookie helps, but no explicit CSRF tokens
- **No role change audit trail:** Role changes are not logged
- **No cooperative-scoped queries:** Users can theoretically see data from other cooperatives (mitigated by UI filtering, not server-side)

### Recommendations for Production

1. Add rate limiting to login/register endpoints
2. Implement CSRF tokens for state-changing operations
3. Add cooperative-scoped data filtering to all queries
4. Log all role changes and sensitive operations
5. Add email verification for registration
6. Implement password reset flow
7. Add session invalidation on password change

---

## Future Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Email invite delivery | Medium | Send invite links via email instead of manual sharing |
| Role change panel | Low | Admin can change existing user roles |
| Audit logging | High | Track all sensitive operations |
| Cooperative data isolation | High | Server-side filtering by cooperative_id |
| Rate limiting | High | Protect auth endpoints from brute-force |
| Password reset | Medium | Self-service password recovery |
| Session management | Medium | View/revoke active sessions |
