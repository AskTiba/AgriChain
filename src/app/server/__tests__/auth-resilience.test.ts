import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCurrentUser } from '../auth-resilience'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

const mockSessionData = {
  userId: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'buyer' as const,
}

function createMockDb(options: { throwOnQuery?: boolean } = {}) {
  const chain = {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue(
          options.throwOnQuery
            ? Promise.reject(new Error('connection refused'))
            : Promise.resolve([{ id: mockSessionData.userId, email: mockSessionData.email, name: mockSessionData.name, role: mockSessionData.role, cooperativeId: null }]),
        ),
      }),
    }),
  }
  return { select: vi.fn().mockReturnValue(chain) } as unknown as NodePgDatabase<typeof schema>
}

describe('resolveCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when session has no userId', async () => {
    const result = await resolveCurrentUser({}, createMockDb())
    expect(result).toBeNull()
  })

  it('returns user from DB when query succeeds', async () => {
    const db = createMockDb()
    const result = await resolveCurrentUser(mockSessionData, db)
    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'buyer',
      cooperativeId: null,
    })
  })

  it('falls back to session data when DB query fails', async () => {
    const db = createMockDb({ throwOnQuery: true })
    const result = await resolveCurrentUser(mockSessionData, db)
    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'buyer',
      cooperativeId: null,
    })
  })

  it('returns null when DB returns no user and session has no data', async () => {
    const db = createMockDb()
    const result = await resolveCurrentUser({}, db)
    expect(result).toBeNull()
  })

  it('returns DB user when DB succeeds even if session is incomplete', async () => {
    const db = createMockDb()
    const result = await resolveCurrentUser({ userId: 'user-123' }, db)
    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'buyer',
      cooperativeId: null,
    })
  })
})
