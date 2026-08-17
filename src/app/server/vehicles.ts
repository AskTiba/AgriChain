import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { vehicles } from '~/app/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireRole } from './auth-middleware'

const VehicleInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['truck', 'pickup', 'motorcycle', 'other']),
  plateNumber: z.string().nullable().optional(),
  payloadCapacity: z.number().int().positive(),
})

export const fetchVehicles = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db.select().from(vehicles).orderBy(desc(vehicles.name))
  })

export const addVehicle = createServerFn({ method: 'POST' })
  .validator(VehicleInputSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data }) => {
    const db = getDb()
    const [newVehicle] = await db.insert(vehicles).values(data).returning()
    return newVehicle
  })

export const deleteVehicle = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(vehicles).where(eq(vehicles.id, data.id))
  })

export const updateVehicleStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), status: z.enum(['available', 'in-use', 'maintenance']) }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data }) => {
    const db = getDb()
    const [updated] = await db
      .update(vehicles)
      .set({ status: data.status })
      .where(eq(vehicles.id, data.id))
      .returning()
    return updated
  })
