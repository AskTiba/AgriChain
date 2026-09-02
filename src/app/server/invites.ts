import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { invites, users, type Invite } from '~/app/db/schema'
import { eq, and, gt, isNull, desc } from 'drizzle-orm'
import { requireRole, authMiddleware } from './auth-middleware'
import { withAuditLog, withAuditLogPublic, type AuditContext, type PublicAuditContext } from './audit-middleware'
import { resolveUserCooperative } from './cooperative-isolation'

const EXPIRY_DAYS = 7

export const createInvite = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'manager', 'driver', 'buyer']),
      cooperativeId: z.string().uuid().nullable().optional(),
    })
  )
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<
      { email: string; role: string; cooperativeId?: string | null | undefined },
      Invite
    >(
      async ({ data, context }: { data: { email: string; role: string; cooperativeId?: string | null | undefined }; context: AuditContext }) => {
        const db = getDb()

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

        const [invite] = await db
          .insert(invites)
          .values({
            email: data.email,
            role: data.role,
            cooperativeId: data.cooperativeId ?? null,
            createdBy: context.session.userId,
            expiresAt,
          } as typeof invites.$inferInsert)
          .returning()

        return invite
      },
      { action: 'invite.create', entityType: 'invite' },
    ),
  )

export const validateInvite = createServerFn({ method: 'GET' })
  .validator(z.object({ token: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb()

    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.token, data.token))
      .limit(1)

    if (!invite) {
      return { valid: false, error: 'Invite not found' }
    }

    if (invite.usedAt) {
      return { valid: false, error: 'Invite already used' }
    }

    if (new Date() > new Date(invite.expiresAt)) {
      return { valid: false, error: 'Invite has expired' }
    }

    return {
      valid: true,
      invite: {
        email: invite.email,
        role: invite.role,
        cooperativeId: invite.cooperativeId,
      },
    }
  })

export const consumeInvite = createServerFn({ method: 'POST' })
  .validator(z.object({ token: z.string().uuid() }))
  .handler(
    withAuditLogPublic<{ token: string }, { role: string; cooperativeId: string | null; email: string }>(
      async ({ data }: { data: { token: string } }) => {
        const db = getDb()

        const [invite] = await db
          .select()
          .from(invites)
          .where(eq(invites.token, data.token))
          .limit(1)

        if (!invite) {
          throw new Error('Invite not found')
        }

        if (invite.usedAt) {
          throw new Error('Invite already used')
        }

        if (new Date() > new Date(invite.expiresAt)) {
          throw new Error('Invite has expired')
        }

        await db
          .update(invites)
          .set({ usedAt: new Date() })
          .where(eq(invites.id, invite.id))

        return {
          role: invite.role,
          cooperativeId: invite.cooperativeId,
          email: invite.email,
        }
      },
      {
        action: 'invite.consume',
        entityType: 'invite',
        publicContext: { userId: 'public', email: 'public@invite', name: 'Public Invite', role: 'public' },
        getEntityId: (r) => (r as { token?: string } | undefined)?.token,
        getDetails: (d) => ({ token: (d as { token: string }).token }),
      },
    ),
  )

export const fetchInvites = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db
      .select({
        id: invites.id,
        email: invites.email,
        role: invites.role,
        cooperativeId: invites.cooperativeId,
        token: invites.token,
        usedAt: invites.usedAt,
        expiresAt: invites.expiresAt,
        createdAt: invites.createdAt,
        createdByName: users.name,
      })
      .from(invites)
      .leftJoin(users, eq(invites.createdBy, users.id))
      .orderBy(desc(invites.createdAt))
    if (cooperativeId) {
      return await query.where(eq(invites.cooperativeId, cooperativeId))
    }
    return await query
  })

export const deleteInvite = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<{ id: string }, void>(
      async ({ data }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        await db.delete(invites).where(eq(invites.id, data.id))
      },
      {
        action: 'invite.delete',
        entityType: 'invite',
        getEntityId: (_, d) => (d as { id: string }).id,
      },
    ),
  )
