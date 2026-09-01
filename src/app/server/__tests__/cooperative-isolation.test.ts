import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveUserCooperative, filterByCooperative } from '../cooperative-isolation'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

function createMockDb(user: { id: string; cooperativeId: string | null } | null = null) {
  const selectChain = {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue(
          user ? Promise.resolve([user]) : Promise.resolve([]),
        ),
      }),
    }),
  }

  return {
    select: vi.fn().mockReturnValue(selectChain),
  } as unknown as NodePgDatabase<typeof schema>
}

describe('cooperative-isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('resolveUserCooperative', () => {
    it('returns cooperativeId when user has one', async () => {
      const db = createMockDb({ id: 'user-1', cooperativeId: 'coop-123' })
      const result = await resolveUserCooperative('user-1', db)
      expect(result).toBe('coop-123')
    })

    it('returns null when user has no cooperative', async () => {
      const db = createMockDb({ id: 'user-1', cooperativeId: null })
      const result = await resolveUserCooperative('user-1', db)
      expect(result).toBeNull()
    })

    it('returns null when user not found', async () => {
      const db = createMockDb(null)
      const result = await resolveUserCooperative('user-1', db)
      expect(result).toBeNull()
    })
  })

  describe('filterByCooperative', () => {
    it('returns original query when cooperativeId is null', () => {
      const query = { where: vi.fn() }
      const result = filterByCooperative(query, null)
      expect(result).toBe(query)
      expect(query.where).not.toHaveBeenCalled()
    })

    it('applies where clause when cooperativeId is provided', () => {
      const query = { where: vi.fn().mockReturnValue({}) }
      const result = filterByCooperative(query, 'coop-123')
      expect(query.where).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })
})
