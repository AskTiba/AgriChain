interface RateLimiterOptions {
  windowMs: number
  maxRequests: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number
}

interface WindowEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private windowMs: number
  private maxRequests: number
  private store = new Map<string, WindowEntry>()

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
  }

  check(key: string): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return { allowed: true, remaining: this.maxRequests - 1, retryAfter: 0 }
    }

    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, remaining: 0, retryAfter }
    }

    entry.count++
    return { allowed: true, remaining: this.maxRequests - entry.count, retryAfter: 0 }
  }
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  return new RateLimiter(options)
}
