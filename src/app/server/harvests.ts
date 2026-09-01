import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { harvestEntries, type HarvestEntry } from '~/app/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireRole, authMiddleware } from './auth-middleware'
import { withAuditLog, type AuditContext } from './audit-middleware'

const HarvestInputSchema = z.object({
  cropType: z.string().min(1),
  qualityGrade: z.string().min(1),
  quantity: z.number().int().positive(),
  fieldId: z.string().min(1),
})

export const fetchHarvests = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const db = getDb()
    return await db.select().from(harvestEntries).orderBy(desc(harvestEntries.timestamp))
  })

export const addHarvest = createServerFn({ method: 'POST' })
  .validator(HarvestInputSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(
    withAuditLog<z.infer<typeof HarvestInputSchema>, HarvestEntry>(
      async ({ data, context }: { data: z.infer<typeof HarvestInputSchema>; context: AuditContext }) => {
        const db = getDb()
        const [newEntry] = await db
          .insert(harvestEntries)
          .values({ ...data, createdBy: context.session.userId })
          .returning()
        return newEntry
      },
      { action: 'harvest.create', entityType: 'harvest' },
    ),
  )

export const deleteHarvest = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(
    withAuditLog<{ id: string }, void>(
      async ({ data }: { data: { id: string }; context: AuditContext }) => {
        const db = getDb()
        await db.delete(harvestEntries).where(eq(harvestEntries.id, data.id))
      },
      {
        action: 'harvest.delete',
        entityType: 'harvest',
        getEntityId: (_, d) => (d as { id: string }).id,
      },
    ),
  )
