import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { generateCsrfToken } from './app/server/csrf'
import { csrfCookieName, getCookie } from './app/server/csrf-middleware'

const secure = process.env.NODE_ENV === 'production'

function withCsrfCookie(request: Request, response: Response): Response {
  if (getCookie(request, csrfCookieName)) {
    return response
  }
  const headers = new Headers(response.headers)
  headers.append(
    'Set-Cookie',
    `${csrfCookieName}=${generateCsrfToken()}; Path=/; Max-Age=604800; SameSite=Lax${secure ? '; Secure' : ''}`,
  )
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default createServerEntry({
  async fetch(request) {
    const response = await handler.fetch(request)
    return withCsrfCookie(request, response)
  },
})