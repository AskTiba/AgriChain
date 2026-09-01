import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import type { CustomFetch } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { csrfHeaderName, getClientCsrfToken, validateCsrfRequest } from './app/server/csrf-middleware'

const clientCsrfFetch: CustomFetch = async (url, init) => {
  const headers = new Headers(init?.headers)
  const token = getClientCsrfToken()
  if (token) {
    headers.set(csrfHeaderName, token)
  }
  return fetch(url, { ...init, headers })
}

const originCsrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

const tokenCsrfMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest()
    if (request.method === 'POST' && !validateCsrfRequest(request)) {
      throw new Error('Invalid CSRF token')
    }
    return next({})
  },
)

export const startInstance = createStart(() => ({
  requestMiddleware: [originCsrfMiddleware],
  functionMiddleware: [tokenCsrfMiddleware],
  serverFns: {
    fetch: clientCsrfFetch,
  },
}))