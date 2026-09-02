import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { cooperatives, users, type Cooperative } from '~/app/db/schema'
import { desc, eq, isNull } from 'drizzle-orm'
import { requireRole, authMiddleware } from './auth-middleware'
import { withAuditLog, type AuditContext } from './audit-middleware'
import { resolveUserCooperative } from './cooperative-isolation'

export const fetchCooperatives = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db.select().from(cooperatives).orderBy(desc(cooperatives.createdAt))
    if (cooperativeId) {
      return await query.where(eq(cooperatives.id, cooperativeId))
    }
    return await query
  })

export const fetchCooperative = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db.select().from(cooperatives).where(eq(cooperatives.id, data.id)).limit(1)
    if (cooperativeId && cooperativeId !== data.id) {
      return undefined
    }
    return (await query)[0] ?? undefined
  })

export const createCooperative = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1),
      location: z.string().min(1),
    })
  )
  .middleware([requireRole(['admin'])])
  .handler(
    withAuditLog<{ name: string; location: string }, Cooperative>(
      async ({ data, context }: { data: { name: string; location: string }; context: AuditContext }) => {
        const db = getDb()
        const [coop] = await db
          .insert(cooperatives)
          .values({
            name: data.name,
            location: data.location,
            createdBy: context.session.userId,
          })
          .returning()
        return coop
      },
      { action: 'cooperative.create', entityType: 'cooperative' },
    ),
  )

export const assignUserToCooperative = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string().uuid(), cooperativeId: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ userId: string; cooperativeId: string }, void>(
      async ({ data }: { data: { userId: string; cooperativeId: string }; context: AuditContext }) => {
        const db = getDb()
        await db.update(users).set({ cooperativeId: data.cooperativeId }).where(eq(users.id, data.userId))
      },
      {
        action: 'cooperative.assign_user',
        entityType: 'cooperative',
        getEntityId: (_, d) => (d as { cooperativeId: string }).cooperativeId,
        getDetails: (d) => ({ userId: (d as { userId: string }).userId, cooperativeId: (d as { cooperativeId: string }).cooperativeId }),
      },
    ),
  )

export const fetchUsersByCooperative = createServerFn({ method: 'GET' })
  .validator(z.object({ cooperativeId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const db = getDb()
    return await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.cooperativeId, data.cooperativeId))
  })

export const completeOnboarding = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      coopName: z.string().min(1),
      region: z.string().min(1),
    })
  )
  .middleware([requireRole(['buyer'])])
  .handler(
    withAuditLog<{ coopName: string; region: string }, Cooperative>(
      async ({ data, context }: { data: { coopName: string; region: string }; context: AuditContext }) => {
        const db = getDb()

        const [coop] = await db
          .insert(cooperatives)
          .values({
            name: data.coopName,
            location: data.region,
            createdBy: context.session.userId,
          })
          .returning()

        await db
          .update(users)
          .set({ cooperativeId: coop.id })
          .where(eq(users.id, context.session.userId))

        return coop
      },
      { action: 'cooperative.onboard', entityType: 'cooperative' },
    ),
  )

export const fetchUnassignedUsers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb()
    return await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(isNull(users.cooperativeId))
  })
