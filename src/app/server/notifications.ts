import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { notifications } from '~/app/db/schema'
import { desc, eq, and, sql } from 'drizzle-orm'
import { authMiddleware } from './auth-middleware'

export const fetchNotifications = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, context.session.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)
  })

export const fetchUnreadCount = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, context.session.userId), eq(notifications.read, false)))
    return result[0]?.count ?? 0
  })

export const createNotification = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      userId: z.string().uuid(),
      type: z.enum(['order_placed', 'order_confirmed', 'driver_assigned', 'status_changed']),
      message: z.string(),
      orderId: z.string().uuid().optional(),
    })
  )
  .handler(async ({ data }) => {
    const db = getDb()
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning()
    return notification
  })

export const markAsRead = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const db = getDb()
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, data.id))
  })

export const markAllAsRead = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, context.session.userId), eq(notifications.read, false)))
  })
