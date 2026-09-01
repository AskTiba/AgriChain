import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter, createRateLimiter } from '../rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('RateLimiter', () => {
    it('allows requests within limit', () => {
      const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 })
      const result = limiter.check('user-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('blocks requests over limit', () => {
      const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 })
      limiter.check('user-1')
      limiter.check('user-1')
      const result = limiter.check('user-1')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('resets after window expires', () => {
      const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 })
      limiter.check('user-1')
      limiter.check('user-1')
      vi.advanceTimersByTime(1001)
      const result = limiter.check('user-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })

    it('tracks different keys separately', () => {
      const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 1 })
      limiter.check('user-1')
      const result = limiter.check('user-2')
      expect(result.allowed).toBe(true)
    })
  })

  describe('createRateLimiter', () => {
    it('creates a middleware-compatible rate limiter', () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 5 })
      expect(limiter).toBeDefined()
      expect(typeof limiter.check).toBe('function')
    })
  })
})
