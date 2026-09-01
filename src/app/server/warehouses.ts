import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireRole, authMiddleware } from './auth-middleware'
import { createWarehouse, fetchWarehousesWithCapacity, assignHarvestToWarehouse } from './warehouse-service'
import { type Warehouse, type HarvestEntry } from '~/app/db/schema'
import { withAuditLog, type AuditContext } from './audit-middleware'

const CreateWarehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  totalCapacityKg: z.number().int().positive(),
  cooperativeId: z.string().uuid().nullable().optional(),
})

export const fetchWarehouses = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    return fetchWarehousesWithCapacity()
  })

export const addWarehouse = createServerFn({ method: 'POST' })
  .validator(CreateWarehouseSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<z.infer<typeof CreateWarehouseSchema>, Warehouse>(
      async ({ data, context }: { data: z.infer<typeof CreateWarehouseSchema>; context: AuditContext }) => {
        return createWarehouse(data)
      },
      { action: 'warehouse.create', entityType: 'warehouse' },
    ),
  )

export const assignHarvest = createServerFn({ method: 'POST' })
  .validator(z.object({
    harvestId: z.string().uuid(),
    warehouseId: z.string().uuid().nullable(),
  }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ harvestId: string; warehouseId: string | null }, HarvestEntry>(
      async ({ data, context }: { data: { harvestId: string; warehouseId: string | null }; context: AuditContext }) => {
        return assignHarvestToWarehouse(data.harvestId, data.warehouseId)
      },
      {
        action: 'warehouse.assign_harvest',
        entityType: 'warehouse',
        getEntityId: (r) => (r as HarvestEntry | undefined)?.id,
        getDetails: (d) => ({ harvestId: (d as { harvestId: string }).harvestId, warehouseId: (d as { warehouseId: string | null }).warehouseId }),
      },
    ),
  )
