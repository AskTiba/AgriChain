import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { orders, notifications, users } from '~/app/db/schema'
import { desc, eq, or } from 'drizzle-orm'
import { authMiddleware, requireRole } from './auth-middleware'

const OrderStatusSchema = z.enum(['pending', 'confirmed', 'in-transit', 'delivered'])

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
  .handler(async () => {
    const db = getDb()
    return await db.select().from(orders).orderBy(desc(orders.createdAt))
  })

export const fetchOrdersByBuyer = createServerFn({ method: 'GET' })
  .validator(z.object({ buyerId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb()
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, data.buyerId))
      .orderBy(desc(orders.createdAt))
  })

export const fetchOrderByOrderNumber = createServerFn({ method: 'GET' })
  .validator(z.object({ orderNumber: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb()
    const results = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, data.orderNumber))
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
  .handler(async ({ data, context }) => {
    const db = getDb()
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
        quantity: data.quantity,
        orderNumber,
      })
      .returning()

    await notifyManagers(db, `New order ${orderNumber} placed for ${data.quantity}kg`, newOrder.id)

    return newOrder
  })

export const confirmOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data, context }) => {
    const db = getDb()
    const [updated] = await db
      .update(orders)
      .set({
        status: 'confirmed',
        confirmedBy: context.session.userId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, data.id))
      .returning()
    if (!updated) throw new Error('Order not found')

    if (updated.buyerId) {
      await notifyUser(db, updated.buyerId, 'order_confirmed', `Order ${updated.orderNumber} has been confirmed`, updated.id)
    }

    return updated
  })

export const assignDriver = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), driverId: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data }) => {
    const db = getDb()
    const [updated] = await db
      .update(orders)
      .set({
        assignedDriverId: data.driverId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, data.id))
      .returning()
    if (!updated) throw new Error('Order not found')

    if (updated.buyerId) {
      await notifyUser(db, updated.buyerId, 'driver_assigned', `A driver has been assigned to order ${updated.orderNumber}`, updated.id)
    }
    await notifyUser(db, data.driverId, 'driver_assigned', `You have been assigned to order ${updated.orderNumber}`, updated.id)

    return updated
  })

export const updateOrderStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), status: OrderStatusSchema }))
  .middleware([requireRole(['admin', 'manager', 'driver'])])
  .handler(async ({ data }) => {
    const db = getDb()
    const [updated] = await db
      .update(orders)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(orders.id, data.id))
      .returning()
    if (!updated) throw new Error('Order not found')

    if (updated.buyerId) {
      const statusLabel = data.status === 'in-transit' ? 'in transit' : data.status
      await notifyUser(db, updated.buyerId, 'status_changed', `Order ${updated.orderNumber} is now ${statusLabel}`, updated.id)
    }

    return updated
  })

export const deleteOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(orders).where(eq(orders.id, data.id))
  })
