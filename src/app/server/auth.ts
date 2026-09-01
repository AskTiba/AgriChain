import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getDb } from '~/app/db'
import { users, sessions, harvestEntries, orders, notifications, invites } from '~/app/db/schema'
import { eq, and, gt, isNull } from 'drizzle-orm'
import { useAppSession } from './session'
import { resolveCurrentUser } from './auth-resilience'
import { rateLimitMiddleware } from './rate-limit-middleware'

const SALT_ROUNDS = 12

const loginRateLimit = rateLimitMiddleware('auth.login', { windowMs: 60_000, maxRequests: 10 })
const registerRateLimit = rateLimitMiddleware('auth.register', { windowMs: 60_000, maxRequests: 5 })
const inviteRegisterRateLimit = rateLimitMiddleware('auth.inviteRegister', { windowMs: 60_000, maxRequests: 10 })

const RegisterInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
})

const InviteRegisterInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  inviteToken: z.string().uuid(),
})

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const register = createServerFn({ method: 'POST' })
  .validator(RegisterInputSchema)
  .middleware([registerRateLimit])
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
        role: 'buyer',
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

export const inviteRegister = createServerFn({ method: 'POST' })
  .validator(InviteRegisterInputSchema)
  .middleware([inviteRegisterRateLimit])
  .handler(async ({ data }) => {
    try {
      const db = getDb()

      // Validate invite
      const [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, data.inviteToken))
        .limit(1)

      if (!invite) {
        throw new Error('Invalid invite link')
      }

      if (invite.usedAt) {
        throw new Error('Invite already used')
      }

      if (new Date() > new Date(invite.expiresAt)) {
        throw new Error('Invite has expired')
      }

      // Check email matches
      if (invite.email.toLowerCase() !== data.email.toLowerCase()) {
        throw new Error('Email does not match invite')
      }

      // Check user doesn't already exist
      const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
      if (existing.length > 0) {
        throw new Error('Email already registered')
      }

      // Create user with invite role and cooperative
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
      const [newUser] = await db.insert(users).values({
        email: data.email,
        name: data.name,
        passwordHash,
        role: invite.role,
        cooperativeId: invite.cooperativeId,
      }).returning()

      // Consume invite
      await db
        .update(invites)
        .set({ usedAt: new Date() })
        .where(eq(invites.id, invite.id))

      // Create session
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
      console.error('[AUTH] Invite register error:', (e as Error).message)
      throw e
    }
  })

export const login = createServerFn({ method: 'POST' })
  .validator(LoginInputSchema)
  .middleware([loginRateLimit])
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

export const deleteAccount = createServerFn({ method: 'POST' })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userId = session.data.userId
    if (!userId) throw new Error('Not authenticated')

    const db = getDb()

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) throw new Error('User not found')

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash)
    if (!passwordValid) throw new Error('Incorrect password')

    await db.delete(sessions).where(eq(sessions.userId, userId))
    await db.delete(notifications).where(eq(notifications.userId, userId))

    await db.update(harvestEntries).set({ createdBy: null }).where(eq(harvestEntries.createdBy, userId))
    await db.update(orders).set({ buyerId: null }).where(eq(orders.buyerId, userId))
    await db.update(orders).set({ confirmedBy: null }).where(eq(orders.confirmedBy, userId))
    await db.update(orders).set({ assignedDriverId: null }).where(eq(orders.assignedDriverId, userId))

    await db.delete(users).where(eq(users.id, userId))

    await session.update({})

    return { ok: true }
  })

export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await useAppSession()
    return resolveCurrentUser(session.data)
  })
