import { describe, it, expect, vi, beforeEach } from 'vitest'
import { csrfCookieName, csrfHeaderName, validateCsrfRequest } from '../csrf-middleware'

function mockRequest(headers: Record<string, string>, cookies: Record<string, string>) {
  const cookieStr = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
  return {
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'cookie') return cookieStr
        return headers[name] ?? null
      },
    },
  } as unknown as Request
}

describe('csrf-middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateCsrfRequest', () => {
    it('returns true when cookie token matches header token', () => {
      const token = 'abc123'
      const request = mockRequest(
        { [csrfHeaderName]: token },
        { [csrfCookieName]: token },
      )
      expect(validateCsrfRequest(request)).toBe(true)
    })

    it('returns false when tokens differ', () => {
      const request = mockRequest(
        { [csrfHeaderName]: 'token-a' },
        { [csrfCookieName]: 'token-b' },
      )
      expect(validateCsrfRequest(request)).toBe(false)
    })

    it('returns false when header token missing', () => {
      const request = mockRequest(
        {},
        { [csrfCookieName]: 'token-a' },
      )
      expect(validateCsrfRequest(request)).toBe(false)
    })

    it('returns false when cookie token missing', () => {
      const request = mockRequest(
        { [csrfHeaderName]: 'token-a' },
        {},
      )
      expect(validateCsrfRequest(request)).toBe(false)
    })
  })
})
