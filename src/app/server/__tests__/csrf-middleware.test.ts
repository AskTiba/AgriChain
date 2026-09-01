import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  csrfCookieName,
  csrfHeaderName,
  validateCsrfRequest,
  readCookieFromString,
  getClientCsrfToken,
} from '../csrf-middleware'

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

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('readCookieFromString', () => {
    it('parses a named cookie value', () => {
      expect(readCookieFromString('a=1; agri-tech-csrf=abc; b=2', csrfCookieName)).toBe('abc')
    })

    it('returns undefined when cookie missing', () => {
      expect(readCookieFromString('a=1; b=2', csrfCookieName)).toBeUndefined()
    })

    it('returns undefined for empty input', () => {
      expect(readCookieFromString(undefined, csrfCookieName)).toBeUndefined()
      expect(readCookieFromString('', csrfCookieName)).toBeUndefined()
    })
  })

  describe('getClientCsrfToken', () => {
    it('reads the token from document.cookie', () => {
      vi.stubGlobal('document', { cookie: `${csrfCookieName}=client-token; other=1` })
      expect(getClientCsrfToken()).toBe('client-token')
    })

    it('returns undefined when document is not defined', () => {
      vi.stubGlobal('document', undefined)
      expect(getClientCsrfToken()).toBeUndefined()
    })
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
