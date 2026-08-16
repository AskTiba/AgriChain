import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getCurrentUser } from '~/app/server/auth'
import type { SafeUser } from '~/app/db/schema'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    let user: SafeUser | null = null
    try {
      user = await getCurrentUser()
    } catch {
      // Not authenticated
    }

    if (!user) {
      throw redirect({ to: '/login' })
    }

    return { user }
  },
  component: () => <Outlet />,
})
