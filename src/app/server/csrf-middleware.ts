import { validateCsrfToken } from './csrf'

export const csrfCookieName = 'agri-tech-csrf'
export const csrfHeaderName = 'x-csrf-token'

export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))
  if (!match) return undefined
  return match.slice(name.length + 1)
}

export function validateCsrfRequest(request: Request): boolean {
  const cookieToken = getCookie(request, csrfCookieName)
  const headerToken = request.headers.get(csrfHeaderName) ?? undefined
  return validateCsrfToken(cookieToken, headerToken)
}
