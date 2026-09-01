import { createAuditLog } from './audit-service'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from '~/app/db/schema'

export interface AuditContext {
  session: {
    userId: string
    email: string
    name: string
    role: string
  }
}

export interface WithAuditLogOptions {
  action: string
  entityType: string
  getEntityId?: (result: unknown, data: unknown) => string | undefined
  getDetails?: (data: unknown) => Record<string, unknown>
}

export function withAuditLog<TInput, TResult>(
  handler: (args: { data: TInput; context: AuditContext }) => Promise<TResult>,
  options: WithAuditLogOptions,
) {
  return async (args: { data: TInput; context: AuditContext }): Promise<TResult> => {
    const result = await handler(args)

    try {
      const entityId = options.getEntityId?.(result, args.data) ?? (result as Record<string, unknown>)?.id as string | undefined
      const details = options.getDetails?.(args.data) ?? (args.data as Record<string, unknown>)

      await createAuditLog({
        userId: args.context.session.userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        details,
      })
    } catch {
      // Audit logging failure should not break the handler
    }

    return result
  }
}
