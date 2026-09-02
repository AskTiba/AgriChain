import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '~/components/landing-page'
import { getCurrentUser } from '~/app/server/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        throw redirect({ to: '/dashboard' })
      }
    } catch (e) {
      // If it's a redirect, rethrow it
      if (e && typeof e === 'object' && 'isRedirect' in e) {
        throw e
      }
      // Not authenticated — show landing page
    }
  },
  component: LandingPage,
})
