import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { orders, notifications, users, type Order } from '~/app/db/schema'
import { desc, eq, or, and } from 'drizzle-orm'
import { authMiddleware, requireRole } from './auth-middleware'
import { withAuditLog, type AuditContext } from './audit-middleware'
import { resolveUserCooperative } from './cooperative-isolation'

const OrderStatusSchema = z.enum(['pending', 'confirmed', 'in-transit', 'delivered'])
type OrderStatus = z.infer<typeof OrderStatusSchema>

async function notifyUser(db: ReturnType<typeof getDb>, userId: string, type: 'order_placed' | 'order_confirmed' | 'driver_assigned' | 'status_changed', message: string, orderId?: string) {
  await db.insert(notifications).values({ userId, type, message, orderId })
}

async function notifyManagers(db: ReturnType<typeof getDb>, message: string, orderId?: string) {
  const managers = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.role, 'manager'), eq(users.role, 'admin')))
  for (const m of managers) {
    await notifyUser(db, m.id, 'order_placed', message, orderId)
  }
}

export const fetchOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db.select().from(orders).orderBy(desc(orders.createdAt))
    if (cooperativeId) {
      return await query.where(eq(orders.cooperativeId, cooperativeId))
    }
    return await query
  })

export const fetchOrdersByBuyer = createServerFn({ method: 'GET' })
  .validator(z.object({ buyerId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const whereClause = cooperativeId
      ? and(eq(orders.buyerId, data.buyerId), eq(orders.cooperativeId, cooperativeId))
      : eq(orders.buyerId, data.buyerId)
    return await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
  })

export const fetchOrderByOrderNumber = createServerFn({ method: 'GET' })
  .validator(z.object({ orderNumber: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const whereClause = cooperativeId
      ? and(eq(orders.orderNumber, data.orderNumber), eq(orders.cooperativeId, cooperativeId))
      : eq(orders.orderNumber, data.orderNumber)
    const results = await db
      .select()
      .from(orders)
      .where(whereClause)
      .limit(1)
    return results[0] ?? undefined
  })

export const addOrder = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      harvestId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  )
  .middleware([authMiddleware])
  .handler(
    withAuditLog<{ harvestId: string; quantity: number }, Order>(
      async ({ data, context }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const maxOrder = await db
          .select({ orderNumber: orders.orderNumber })
          .from(orders)
          .orderBy(desc(orders.orderNumber))
          .limit(1)

        let nextNumber = 1
        if (maxOrder.length > 0) {
          const match = maxOrder[0].orderNumber.match(/ORD-(\d+)/)
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1
          }
        }
        const orderNumber = `ORD-${String(nextNumber).padStart(6, '0')}`

        const [newOrder] = await db
          .insert(orders)
          .values({
            harvestId: data.harvestId,
            buyerId: context.session.userId,
            cooperativeId,
            quantity: data.quantity,
            orderNumber,
          })
          .returning()

        await notifyManagers(db, `New order ${orderNumber} placed for ${data.quantity}kg`, newOrder.id)

        return newOrder
      },
      { action: 'order.create', entityType: 'order' },
    ),
  )

export const confirmOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ id: string }, Order>(
      async ({ data, context }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(orders.id, data.id), eq(orders.cooperativeId, cooperativeId))
          : eq(orders.id, data.id)
        const [updated] = await db
          .update(orders)
          .set({
            status: 'confirmed',
            confirmedBy: context.session.userId,
            updatedAt: new Date(),
          })
          .where(whereClause)
          .returning()
        if (!updated) throw new Error('Order not found')

        if (updated.buyerId) {
          await notifyUser(db, updated.buyerId, 'order_confirmed', `Order ${updated.orderNumber} has been confirmed`, updated.id)
        }

        return updated
      },
      { action: 'order.confirm', entityType: 'order' },
    ),
  )

export const assignDriver = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), driverId: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ id: string; driverId: string }, Order>(
      async ({ data, context }: { data: { id: string; driverId: string }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(orders.id, data.id), eq(orders.cooperativeId, cooperativeId))
          : eq(orders.id, data.id)
        const [updated] = await db
          .update(orders)
          .set({
            assignedDriverId: data.driverId,
            updatedAt: new Date(),
          })
          .where(whereClause)
          .returning()
        if (!updated) throw new Error('Order not found')

        if (updated.buyerId) {
          await notifyUser(db, updated.buyerId, 'driver_assigned', `A driver has been assigned to order ${updated.orderNumber}`, updated.id)
        }
        await notifyUser(db, data.driverId, 'driver_assigned', `You have been assigned to order ${updated.orderNumber}`, updated.id)

        return updated
      },
      { action: 'order.assign_driver', entityType: 'order' },
    ),
  )

export const updateOrderStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), status: OrderStatusSchema }))
  .middleware([requireRole(['admin', 'manager', 'driver'])])
  .handler(
    withAuditLog<{ id: string; status: OrderStatus }, Order>(
      async ({ data, context }: { data: { id: string; status: OrderStatus }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(orders.id, data.id), eq(orders.cooperativeId, cooperativeId))
          : eq(orders.id, data.id)
        const [updated] = await db
          .update(orders)
          .set({ status: data.status, updatedAt: new Date() })
          .where(whereClause)
          .returning()
        if (!updated) throw new Error('Order not found')

        if (updated.buyerId) {
          const statusLabel = data.status === 'in-transit' ? 'in transit' : data.status
          await notifyUser(db, updated.buyerId, 'status_changed', `Order ${updated.orderNumber} is now ${statusLabel}`, updated.id)
        }

        return updated
      },
      {
        action: 'order.update_status',
        entityType: 'order',
        getDetails: (d) => ({ status: (d as { status: string }).status }),
      },
    ),
  )

export const deleteOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(
    withAuditLog<{ id: string }, void>(
      async ({ data, context }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(orders.id, data.id), eq(orders.cooperativeId, cooperativeId))
          : eq(orders.id, data.id)
        await db.delete(orders).where(whereClause)
      },
      {
        action: 'order.delete',
        entityType: 'order',
        getEntityId: (_, d) => (d as { id: string }).id,
      },
    ),
  )
