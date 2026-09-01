import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateCsrfToken, validateCsrfToken } from '../csrf'

describe('csrf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateCsrfToken', () => {
    it('generates a token string', () => {
      const token = generateCsrfToken()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('generates unique tokens', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('validateCsrfToken', () => {
    it('returns true when tokens match', () => {
      const token = generateCsrfToken()
      expect(validateCsrfToken(token, token)).toBe(true)
    })

    it('returns false when tokens differ', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(validateCsrfToken(token1, token2)).toBe(false)
    })

    it('returns false when either token is missing', () => {
      const token = generateCsrfToken()
      expect(validateCsrfToken(token, '')).toBe(false)
      expect(validateCsrfToken('', token)).toBe(false)
      expect(validateCsrfToken('', '')).toBe(false)
    })
  })
})
