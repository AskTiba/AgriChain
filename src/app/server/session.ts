import { useSession } from '@tanstack/react-start/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'agri-tech-dev-secret-change-in-production-32ch'

export const sessionConfig = {
  password: SESSION_SECRET,
  cookieName: 'agri-tech-session',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
}

export interface SessionData {
  userId?: string
  email?: string
  name?: string
  role?: string
}

export function useAppSession() {
  return useSession<SessionData>(sessionConfig)
}
