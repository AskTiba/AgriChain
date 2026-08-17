import { createFileRoute } from '@tanstack/react-router'
import { InviteRegisterPage } from '~/components/invite-register-page'

export const Route = createFileRoute('/invite/$token')({
  component: InviteRegisterPage,
})
