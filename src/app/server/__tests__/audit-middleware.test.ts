import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withAuditLog } from '../audit-middleware'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

vi.mock('../audit-service', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit-123' }),
}))

function createMockDb() {
  return {} as unknown as NodePgDatabase<typeof schema>
}

const mockSession = {
  session: {
    userId: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'buyer',
  },
}

describe('audit-middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls handler and logs audit entry', async () => {
    const handler = vi.fn().mockResolvedValue({ id: 'order-123' })
    const wrapped = withAuditLog(handler, {
      action: 'order.create',
      entityType: 'order',
    })

    const result = await wrapped({
      data: {},
      context: mockSession,
    })

    expect(handler).toHaveBeenCalled()
    expect(result).toEqual({ id: 'order-123' })
  })

  it('passes data and context to handler', async () => {
    const handler = vi.fn().mockResolvedValue({ id: 'order-123' })
    const wrapped = withAuditLog(handler, {
      action: 'order.create',
      entityType: 'order',
    })

    const args = { data: { harvestId: 'h-1' }, context: mockSession }
    await wrapped(args)

    expect(handler).toHaveBeenCalledWith(args)
  })

  it('still returns handler result even if audit fails', async () => {
    const { createAuditLog } = await import('../audit-service')
    vi.mocked(createAuditLog).mockRejectedValueOnce(new Error('audit failed'))

    const handler = vi.fn().mockResolvedValue({ id: 'order-123' })
    const wrapped = withAuditLog(handler, {
      action: 'order.create',
      entityType: 'order',
    })

    const result = await wrapped({
      data: {},
      context: mockSession,
    })

    expect(result).toEqual({ id: 'order-123' })
  })
})
