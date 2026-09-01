import { eq, desc } from 'drizzle-orm'
import { auditLogs } from '~/app/db/schema'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

interface CreateAuditLogInput {
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(
  input: CreateAuditLogInput,
  db: NodePgDatabase<typeof schema> = require('~/app/db').getDb(),
) {
  const [log] = await db
    .insert(auditLogs)
    .values({
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      details: input.details ? JSON.stringify(input.details) : null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning()
  return log
}

interface FetchAuditLogsInput {
  userId?: string
  entityType?: string
  limit?: number
  offset?: number
}

export async function fetchAuditLogs(
  input: FetchAuditLogsInput,
  db: NodePgDatabase<typeof schema> = require('~/app/db').getDb(),
) {
  const limit = input.limit ?? 50
  const offset = input.offset ?? 0

  let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt))

  if (input.userId) {
    query = query.where(eq(auditLogs.userId, input.userId)) as typeof query
  }
  if (input.entityType) {
    query = query.where(eq(auditLogs.entityType, input.entityType)) as typeof query
  }

  return query.limit(limit).offset(offset)
}
