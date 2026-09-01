import { validateCsrfToken } from './csrf'

export const csrfCookieName = 'agri-tech-csrf'
export const csrfHeaderName = 'x-csrf-token'

export function readCookieFromString(cookieString: string | null | undefined, name: string): string | undefined {
  if (!cookieString) return undefined
  const match = cookieString.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))
  if (!match) return undefined
  return match.slice(name.length + 1)
}

export function getCookie(request: Request, name: string): string | undefined {
  return readCookieFromString(request.headers.get('cookie'), name)
}

export function getClientCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined
  return readCookieFromString(document.cookie, csrfCookieName)
}

export function validateCsrfRequest(request: Request): boolean {
  const cookieToken = getCookie(request, csrfCookieName)
  const headerToken = request.headers.get(csrfHeaderName) ?? undefined
  return validateCsrfToken(cookieToken, headerToken)
}
