import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWarehouse, fetchWarehousesWithCapacity, assignHarvestToWarehouse } from '../warehouse-service'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

const mockWarehouse = {
  id: 'wh-123',
  name: 'Test Warehouse',
  location: 'Test Location',
  totalCapacityKg: 1000,
  cooperativeId: null,
  createdAt: new Date(),
}

const mockWarehouseWithCapacity = {
  ...mockWarehouse,
  used: 500,
}

function createMockDb(options: { throwOnInsert?: boolean; throwOnSelect?: boolean; returnEmpty?: boolean } = {}) {
  const insertChain = {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockReturnValue(
        options.throwOnInsert
          ? Promise.reject(new Error('insert failed'))
          : Promise.resolve([mockWarehouse]),
      ),
    }),
  }

  const selectChain = {
    from: vi.fn().mockReturnValue({
      leftJoin: vi.fn().mockReturnValue({
        groupBy: vi.fn().mockReturnValue(
          options.throwOnSelect
            ? Promise.reject(new Error('select failed'))
            : options.returnEmpty
              ? Promise.resolve([])
              : Promise.resolve([mockWarehouseWithCapacity]),
        ),
      }),
    }),
  }

  const updateChain = {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue(
          Promise.resolve([{ ...mockWarehouse, warehouseId: 'wh-123' }]),
        ),
      }),
    }),
  }

  return {
    insert: vi.fn().mockReturnValue(insertChain),
    select: vi.fn().mockReturnValue(selectChain),
    update: vi.fn().mockReturnValue(updateChain),
  } as unknown as NodePgDatabase<typeof schema>
}

describe('warehouse-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createWarehouse', () => {
    it('creates a warehouse and returns it', async () => {
      const db = createMockDb()
      const result = await createWarehouse(
        { name: 'Test Warehouse', location: 'Test Location', totalCapacityKg: 1000 },
        db,
      )
      expect(result).toEqual(mockWarehouse)
      expect(db.insert).toHaveBeenCalled()
    })

    it('throws when DB insert fails', async () => {
      const db = createMockDb({ throwOnInsert: true })
      await expect(
        createWarehouse({ name: 'Test', location: 'Loc', totalCapacityKg: 100 }, db),
      ).rejects.toThrow('insert failed')
    })
  })

  describe('fetchWarehousesWithCapacity', () => {
    it('returns warehouses with computed used capacity', async () => {
      const db = createMockDb()
      const result = await fetchWarehousesWithCapacity(db)
      expect(result).toHaveLength(1)
      expect(result[0].used).toBe(500)
      expect(result[0].name).toBe('Test Warehouse')
    })

    it('returns empty array when no warehouses exist', async () => {
      const db = createMockDb({ returnEmpty: true })
      const result = await fetchWarehousesWithCapacity(db)
      expect(result).toHaveLength(0)
    })

    it('throws when DB query fails', async () => {
      const db = createMockDb({ throwOnSelect: true })
      await expect(fetchWarehousesWithCapacity(db)).rejects.toThrow('select failed')
    })
  })

  describe('assignHarvestToWarehouse', () => {
    it('assigns a harvest to a warehouse', async () => {
      const db = createMockDb()
      const result = await assignHarvestToWarehouse('harvest-1', 'wh-123', db)
      expect(result).toBeDefined()
      expect(db.update).toHaveBeenCalled()
    })

    it('unassigns a harvest when warehouseId is null', async () => {
      const db = createMockDb()
      const result = await assignHarvestToWarehouse('harvest-1', null, db)
      expect(result).toBeDefined()
    })
  })
})
