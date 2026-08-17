import { createMiddleware } from '@tanstack/react-start'
import { useAppSession } from './session'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await useAppSession()
    const data = session.data

    if (!data.userId) {
      throw new Error('Unauthorized')
    }

    return next({
      context: {
        session: {
          userId: data.userId!,
          email: data.email!,
          name: data.name!,
          role: data.role!,
        },
      },
    })
  },
)

type UserRole = 'admin' | 'manager' | 'driver' | 'buyer'

export function requireRole(allowedRoles: UserRole[]) {
  return createMiddleware({ type: 'function' }).server(
    async ({ next }) => {
      const session = await useAppSession()
      const data = session.data

      if (!data.userId) {
        throw new Error('Unauthorized')
      }

      if (!data.role || !allowedRoles.includes(data.role as UserRole)) {
        throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
      }

      return next({
        context: {
          session: {
            userId: data.userId!,
            email: data.email!,
            name: data.name!,
            role: data.role!,
          },
        },
      })
    },
  )
}
