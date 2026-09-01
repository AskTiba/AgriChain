import { RateLimiter } from './rate-limiter'

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
