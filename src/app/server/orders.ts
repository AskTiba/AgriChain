import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { orders } from '~/app/db/schema'
import { desc, eq } from 'drizzle-orm'

const OrderStatusSchema = z.enum(['pending', 'confirmed', 'delivered'])

export const fetchOrders = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db.select().from(orders).orderBy(desc(orders.createdAt))
  })

export const fetchOrdersByBuyer = createServerFn({ method: 'GET' })
  .validator(z.object({ buyerId: z.string() }))
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
      buyerId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  )
  .handler(async ({ data }) => {
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
      .values({ ...data, orderNumber })
      .returning()
    return newOrder
  })

export const updateOrderStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), status: OrderStatusSchema }))
  .handler(async ({ data }) => {
    const db = getDb()
    const [updated] = await db
      .update(orders)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(orders.id, data.id))
      .returning()
    if (!updated) throw new Error('Order not found')
    return updated
  })

export const deleteOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(orders).where(eq(orders.id, data.id))
  })
