import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit } from '../rate-limit-middleware'

describe('rate-limit-middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('allows request within limit', () => {
      const result = checkRateLimit('auth.login', '1.2.3.4', { windowMs: 60000, maxRequests: 5 })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('blocks request over limit', () => {
      checkRateLimit('auth.login.blocktest', '1.2.3.4', { windowMs: 60000, maxRequests: 2 })
      checkRateLimit('auth.login.blocktest', '1.2.3.4', { windowMs: 60000, maxRequests: 2 })
      const result = checkRateLimit('auth.login.blocktest', '1.2.3.4', { windowMs: 60000, maxRequests: 2 })
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
      expect(result.remaining).toBe(0)
    })

    it('tracks endpoints separately', () => {
      checkRateLimit('auth.login.endpoint', '1.2.3.4', { windowMs: 60000, maxRequests: 1 })
      const result = checkRateLimit('auth.register.endpoint', '1.2.3.4', { windowMs: 60000, maxRequests: 1 })
      expect(result.allowed).toBe(true)
    })

    it('tracks different IPs separately', () => {
      checkRateLimit('auth.login.separate', '1.1.1.1', { windowMs: 60000, maxRequests: 1 })
      const result = checkRateLimit('auth.login.separate', '2.2.2.2', { windowMs: 60000, maxRequests: 1 })
      expect(result.allowed).toBe(true)
    })

    it('resets after window expires', () => {
      checkRateLimit('auth.login.reset', '1.2.3.4', { windowMs: 1000, maxRequests: 1 })
      checkRateLimit('auth.login.reset', '1.2.3.4', { windowMs: 1000, maxRequests: 1 })
      vi.advanceTimersByTime(1001)
      const result = checkRateLimit('auth.login.reset', '1.2.3.4', { windowMs: 1000, maxRequests: 1 })
      expect(result.allowed).toBe(true)
    })
  })
})
