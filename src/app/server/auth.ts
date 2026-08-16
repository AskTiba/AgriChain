import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getDb } from '~/app/db'
import { users, sessions } from '~/app/db/schema'
import { eq } from 'drizzle-orm'
import { useAppSession } from './session'
import { resolveCurrentUser } from './auth-resilience'

const SALT_ROUNDS = 12

const RegisterInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'driver', 'buyer']).default('buyer'),
})

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const register = createServerFn({ method: 'POST' })
  .validator(RegisterInputSchema)
  .handler(async ({ data }) => {
    try {
      const db = getDb()

      const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
      if (existing.length > 0) {
        throw new Error('Email already registered')
      }

      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
      const [newUser] = await db.insert(users).values({
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      }).returning()

      const session = await useAppSession()
      await session.update({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      })

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }
    } catch (e) {
      console.error('[AUTH] Register error:', (e as Error).message)
      throw e
    }
  })

export const login = createServerFn({ method: 'POST' })
  .validator(LoginInputSchema)
  .handler(async ({ data }) => {
    try {
      const db = getDb()

      const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
      if (!user) {
        throw new Error('Invalid email or password')
      }

      const passwordValid = await bcrypt.compare(data.password, user.passwordHash)
      if (!passwordValid) {
        throw new Error('Invalid email or password')
      }

      await db.delete(sessions).where(eq(sessions.userId, user.id))

      const session = await useAppSession()
      await session.update({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    } catch (e) {
      console.error('[AUTH] Login error:', (e as Error).message)
      throw e
    }
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await useAppSession()
    const data = session.data

    if (data.userId) {
      const db = getDb()
      await db.delete(sessions).where(eq(sessions.userId, data.userId))
    }

    await session.update({})
    return { ok: true }
  })

export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await useAppSession()
    return resolveCurrentUser(session.data)
  })
