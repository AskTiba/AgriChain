import { RateLimiter } from './rate-limiter'
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

const endpointLimiters = new Map<string, RateLimiter>()

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('user-agent') ?? 'unknown'
}

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export function checkRateLimit(
  endpoint: string,
  clientKey: string,
  options: RateLimitOptions,
): { allowed: boolean; remaining: number; retryAfter: number } {
  let limiter = endpointLimiters.get(endpoint)
  if (!limiter) {
    limiter = new RateLimiter(options)
    endpointLimiters.set(endpoint, limiter)
  }

  return limiter.check(clientKey)
}

export function assertRateLimit(endpoint: string, request: Request, options: RateLimitOptions): void {
  const key = getClientKey(request)
  const result = checkRateLimit(endpoint, key, options)

  if (!result.allowed) {
    throw new Error(`Too many requests. Please try again in ${result.retryAfter}s`)
  }
}

export function rateLimitMiddleware(endpoint: string, options: RateLimitOptions) {
  return createMiddleware({ type: 'function' }).server(
    async ({ next }) => {
      assertRateLimit(endpoint, getRequest(), options)
      return next({})
    },
  )
}
