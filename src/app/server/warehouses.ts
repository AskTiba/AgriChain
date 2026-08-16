import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from './auth-middleware'
import { createWarehouse, fetchWarehousesWithCapacity, assignHarvestToWarehouse } from './warehouse-service'

const CreateWarehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  totalCapacityKg: z.number().int().positive(),
  cooperativeId: z.string().uuid().nullable().optional(),
})

export const fetchWarehouses = createServerFn({ method: 'GET' })
  .handler(async () => {
    return fetchWarehousesWithCapacity()
  })

export const addWarehouse = createServerFn({ method: 'POST' })
  .validator(CreateWarehouseSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    return createWarehouse(data)
  })

export const assignHarvest = createServerFn({ method: 'POST' })
  .validator(z.object({
    harvestId: z.string().uuid(),
    warehouseId: z.string().uuid().nullable(),
  }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    return assignHarvestToWarehouse(data.harvestId, data.warehouseId)
  })
