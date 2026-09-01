import { eq } from 'drizzle-orm'
import { users } from '~/app/db/schema'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'
import type { PgColumn } from 'drizzle-orm/pg-core'

export async function resolveUserCooperative(
  userId: string,
  db: NodePgDatabase<typeof schema> = require('~/app/db').getDb(),
): Promise<string | null> {
  const result = await db
    .select({ cooperativeId: users.cooperativeId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (result.length === 0) return null
  return result[0].cooperativeId
}

export function filterByCooperative<T extends { where: (clause: unknown) => T }>(
  query: T,
  cooperativeId: string | null,
  column?: PgColumn,
): T {
  if (!cooperativeId || !column) return query
  return query.where(eq(column, cooperativeId))
}
