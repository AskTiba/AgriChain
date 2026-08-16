import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { assignments } from '~/app/db/schema'
import { desc, eq } from 'drizzle-orm'
import { authMiddleware } from './auth-middleware'

const AssignmentInputSchema = z.object({
  harvestId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  driverName: z.string().min(1),
  destination: z.string().min(1),
})

export const fetchAssignments = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db.select().from(assignments).orderBy(desc(assignments.createdAt))
  })

export const addAssignment = createServerFn({ method: 'POST' })
  .validator(AssignmentInputSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const db = getDb()
    const [newAssignment] = await db.insert(assignments).values(data).returning()
    return newAssignment
  })

export const deleteAssignment = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(assignments).where(eq(assignments.id, data.id))
  })
