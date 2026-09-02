import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { assignments, type Assignment } from '~/app/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { requireRole, authMiddleware } from './auth-middleware'
import { withAuditLog, type AuditContext } from './audit-middleware'
import { resolveUserCooperative } from './cooperative-isolation'

const AssignmentInputSchema = z.object({
  harvestId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  driverName: z.string().min(1),
  destination: z.string().min(1),
})

export const fetchAssignments = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const cooperativeId = await resolveUserCooperative(context.session.userId)
    const query = db.select().from(assignments).orderBy(desc(assignments.createdAt))
    if (cooperativeId) {
      return await query.where(eq(assignments.cooperativeId, cooperativeId))
    }
    return await query
  })

export const addAssignment = createServerFn({ method: 'POST' })
  .validator(AssignmentInputSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<z.infer<typeof AssignmentInputSchema>, Assignment>(
      async ({ data, context }: { data: z.infer<typeof AssignmentInputSchema>; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const [newAssignment] = await db
          .insert(assignments)
          .values({ ...data, cooperativeId })
          .returning()
        return newAssignment
      },
      { action: 'assignment.create', entityType: 'assignment' },
    ),
  )

export const deleteAssignment = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(
    withAuditLog<{ id: string }, void>(
      async ({ data, context }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        const cooperativeId = await resolveUserCooperative(context.session.userId)
        const whereClause = cooperativeId
          ? and(eq(assignments.id, data.id), eq(assignments.cooperativeId, cooperativeId))
          : eq(assignments.id, data.id)
        await db.delete(assignments).where(whereClause)
      },
      {
        action: 'assignment.delete',
        entityType: 'assignment',
        getEntityId: (_, d) => (d as { id: string }).id,
      },
    ),
  )
