import { getDb } from '~/app/db'
import { warehouses, harvestEntries } from '~/app/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

interface CreateWarehouseInput {
  name: string
  location: string
  totalCapacityKg: number
  cooperativeId?: string | null
}

export async function createWarehouse(
  input: CreateWarehouseInput,
  db: NodePgDatabase<typeof schema> = getDb(),
) {
  const [warehouse] = await db.insert(warehouses).values({
    name: input.name,
    location: input.location,
    totalCapacityKg: input.totalCapacityKg,
    cooperativeId: input.cooperativeId ?? null,
  }).returning()
  return warehouse
}

export async function fetchWarehousesWithCapacity(
  db: NodePgDatabase<typeof schema> = getDb(),
  cooperativeId?: string | null,
) {
  const query = db
    .select({
      id: warehouses.id,
      name: warehouses.name,
      location: warehouses.location,
      totalCapacityKg: warehouses.totalCapacityKg,
      cooperativeId: warehouses.cooperativeId,
      createdAt: warehouses.createdAt,
      used: sql<number>`coalesce(sum(${harvestEntries.quantity}), 0)`,
    })
    .from(warehouses)
    .leftJoin(harvestEntries, eq(warehouses.id, harvestEntries.warehouseId))
    .groupBy(warehouses.id)

  if (cooperativeId) {
    return await query.where(eq(warehouses.cooperativeId, cooperativeId))
  }
  return await query
}

export async function assignHarvestToWarehouse(
  harvestId: string,
  warehouseId: string | null,
  db: NodePgDatabase<typeof schema> = getDb(),
) {
  const [updated] = await db
    .update(harvestEntries)
    .set({ warehouseId })
    .where(eq(harvestEntries.id, harvestId))
    .returning()
  return updated
}
