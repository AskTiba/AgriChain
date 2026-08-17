import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '~/app/db'
import { harvestEntries } from '~/app/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireRole } from './auth-middleware'

const HarvestInputSchema = z.object({
  cropType: z.string().min(1),
  qualityGrade: z.string().min(1),
  quantity: z.number().int().positive(),
  fieldId: z.string().min(1),
})

export const fetchHarvests = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDb()
    return await db.select().from(harvestEntries).orderBy(desc(harvestEntries.timestamp))
  })

export const addHarvest = createServerFn({ method: 'POST' })
  .validator(HarvestInputSchema)
  .middleware([requireRole(['admin', 'manager'])])
  .handler(async ({ data, context }) => {
    const db = getDb()
    const [newEntry] = await db
      .insert(harvestEntries)
      .values({ ...data, createdBy: context.session.userId })
      .returning()
    return newEntry
  })

export const deleteHarvest = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .middleware([requireRole(['admin'])])
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(harvestEntries).where(eq(harvestEntries.id, data.id))
  })
