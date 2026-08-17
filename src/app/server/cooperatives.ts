import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { cooperatives, users } from '~/app/db/schema'
import { desc, eq, isNull } from 'drizzle-orm'
import { requireRole } from './auth-middleware'

export const fetchCooperatives = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db.select().from(cooperatives).orderBy(desc(cooperatives.createdAt))
  })

export const fetchCooperative = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb()
    const results = await db.select().from(cooperatives).where(eq(cooperatives.id, data.id)).limit(1)
    return results[0] ?? undefined
  })

export const createCooperative = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1),
      location: z.string().min(1),
    })
  )
  .middleware([requireRole(['admin'])])
  .handler(async ({ data, context }) => {
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
  })

export const assignUserToCooperative = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string().uuid(), cooperativeId: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data }) => {
    const db = getDb()
    await db.update(users).set({ cooperativeId: data.cooperativeId }).where(eq(users.id, data.userId))
  })

export const fetchUsersByCooperative = createServerFn({ method: 'GET' })
  .validator(z.object({ cooperativeId: z.string().uuid() }))
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
  .handler(async ({ data, context }) => {
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
  })

export const fetchUnassignedUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(isNull(users.cooperativeId))
  })
