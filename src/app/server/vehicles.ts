import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { vehicles, type Vehicle } from '~/app/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { requireRole, authMiddleware } from './auth-middleware'
import { withAuditLog, type AuditContext } from './audit-middleware'
import { resolveUserCooperative } from './cooperative-isolation'

const VehicleInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['truck', 'pickup', 'motorcycle', 'other']),
  plateNumber: z.string().nullable().optional(),
  payloadCapacity: z.number().int().positive(),
})

export const fetchVehicles = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db.select().from(vehicles).orderBy(desc(vehicles.name))
    if (cooperativeId) {
      return await query.where(eq(vehicles.cooperativeId, cooperativeId))
    }
    return await query
  })

export const addVehicle = createServerFn({ method: 'POST' })
  .validator(VehicleInputSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<z.infer<typeof VehicleInputSchema>, Vehicle>(
      async ({ data, context }: { data: z.infer<typeof VehicleInputSchema>; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const [newVehicle] = await db
          .insert(vehicles)
          .values({ ...data, cooperativeId })
          .returning()
        return newVehicle
      },
      { action: 'vehicle.create', entityType: 'vehicle' },
    ),
  )

export const deleteVehicle = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(
    withAuditLog<{ id: string }, void>(
      async ({ data, context }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(vehicles.id, data.id), eq(vehicles.cooperativeId, cooperativeId))
          : eq(vehicles.id, data.id)
        await db.delete(vehicles).where(whereClause)
      },
      {
        action: 'vehicle.delete',
        entityType: 'vehicle',
        getEntityId: (_, d) => (d as { id: string }).id,
      },
    ),
  )

export const updateVehicleStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid(), status: z.enum(['available', 'in-use', 'maintenance']) }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ id: string; status: 'available' | 'in-use' | 'maintenance' }, Vehicle>(
      async ({ data, context }: { data: { id: string; status: 'available' | 'in-use' | 'maintenance' }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(vehicles.id, data.id), eq(vehicles.cooperativeId, cooperativeId))
          : eq(vehicles.id, data.id)
        const [updated] = await db
          .update(vehicles)
          .set({ status: data.status })
          .where(whereClause)
          .returning()
        return updated
      },
      {
        action: 'vehicle.update_status',
        entityType: 'vehicle',
        getDetails: (d) => ({ status: (d as { status: string }).status }),
      },
    ),
  )
