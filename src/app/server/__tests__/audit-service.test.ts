import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuditLog, fetchAuditLogs } from '../audit-service'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

const mockAuditLog = {
  id: 'audit-123',
  userId: 'user-123',
  action: 'order.create',
  entityType: 'order',
  entityId: 'order-456',
  details: { orderNumber: 'ORD-001' },
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date(),
}

function createMockDb(options: { throwOnInsert?: boolean; throwOnSelect?: boolean; returnEmpty?: boolean } = {}) {
  const insertChain = {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockReturnValue(
        options.throwOnInsert
          ? Promise.reject(new Error('insert failed'))
          : Promise.resolve([mockAuditLog]),
      ),
    }),
  }

  const selectChain = {
    from: vi.fn().mockReturnValue({
      orderBy: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockReturnValue(
            options.throwOnSelect
              ? Promise.reject(new Error('select failed'))
              : options.returnEmpty
                ? Promise.resolve([])
                : Promise.resolve([mockAuditLog]),
          ),
        }),
      }),
    }),
  }

  return {
    insert: vi.fn().mockReturnValue(insertChain),
    select: vi.fn().mockReturnValue(selectChain),
  } as unknown as NodePgDatabase<typeof schema>
}

describe('audit-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAuditLog', () => {
    it('creates an audit log entry', async () => {
      const db = createMockDb()
      const result = await createAuditLog(
        {
          userId: 'user-123',
          action: 'order.create',
          entityType: 'order',
          entityId: 'order-456',
          details: { orderNumber: 'ORD-001' },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
        },
        db,
      )
      expect(result).toEqual(mockAuditLog)
      expect(db.insert).toHaveBeenCalled()
    })

    it('throws when DB insert fails', async () => {
      const db = createMockDb({ throwOnInsert: true })
      await expect(
        createAuditLog(
          {
            userId: 'user-123',
            action: 'order.create',
            entityType: 'order',
            entityId: 'order-456',
          },
          db,
        ),
      ).rejects.toThrow('insert failed')
    })
  })

  describe('fetchAuditLogs', () => {
    it('returns audit logs', async () => {
      const db = createMockDb()
      const result = await fetchAuditLogs({}, db)
      expect(result).toHaveLength(1)
      expect(result[0].action).toBe('order.create')
    })

    it('returns empty array when no logs exist', async () => {
      const db = createMockDb({ returnEmpty: true })
      const result = await fetchAuditLogs({}, db)
      expect(result).toHaveLength(0)
    })

    it('throws when DB query fails', async () => {
      const db = createMockDb({ throwOnSelect: true })
      await expect(fetchAuditLogs({}, db)).rejects.toThrow('select failed')
    })
  })
})
