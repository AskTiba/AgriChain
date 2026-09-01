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

  it('derives entityId from input data when result has no id', async () => {
    const { createAuditLog } = await import('../audit-service')
    const handler = vi.fn().mockResolvedValue(undefined)
    const wrapped = withAuditLog(handler, {
      action: 'order.delete',
      entityType: 'order',
      getEntityId: (_, data) => (data as { id: string }).id,
    })

    await wrapped({
      data: { id: 'order-456' },
      context: mockSession,
    })

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'order-456', action: 'order.delete' }),
    )
  })

  it('passes details from custom getDetails', async () => {
    const { createAuditLog } = await import('../audit-service')
    const handler = vi.fn().mockResolvedValue({ id: 'order-123' })
    const wrapped = withAuditLog(handler, {
      action: 'order.status_change',
      entityType: 'order',
      getDetails: (data) => ({ status: (data as { status: string }).status }),
    })

    await wrapped({
      data: { id: 'order-123', status: 'confirmed' },
      context: mockSession,
    })

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ details: { status: 'confirmed' } }),
    )
  })
})
