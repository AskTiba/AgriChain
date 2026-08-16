import { getDb } from '~/app/db'
import { users } from '~/app/db/schema'
import { eq } from 'drizzle-orm'
import type { SafeUser } from '~/app/db/schema'

interface SessionData {
  userId?: string
  email?: string
  name?: string
  role?: string
}

export async function resolveCurrentUser(
  sessionData: SessionData,
  db: ReturnType<typeof getDb> = getDb(),
): Promise<SafeUser | null> {
  if (!sessionData.userId) {
    return null
  }

  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      cooperativeId: users.cooperativeId,
    }).from(users).where(eq(users.id, sessionData.userId)).limit(1)

    if (user) {
      return user
    }
  } catch (e) {
    console.error('[AUTH] DB query failed, falling back to session:', (e as Error).message)
  }

  if (sessionData.userId && sessionData.email && sessionData.name && sessionData.role) {
    return {
      id: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      role: sessionData.role as SafeUser['role'],
      cooperativeId: null,
    }
  }

  return null
}
