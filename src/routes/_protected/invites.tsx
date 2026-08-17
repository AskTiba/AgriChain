import { createFileRoute } from '@tanstack/react-router'
import { InvitesPage } from '~/components/invites-page'

export const Route = createFileRoute('/_protected/invites')({
  component: InvitesPage,
})
