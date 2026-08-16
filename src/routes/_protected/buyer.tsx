import { createFileRoute } from '@tanstack/react-router'
import { BuyerPage } from '~/components/buyer-page'

export const Route = createFileRoute('/_protected/buyer')({
  component: BuyerPage,
})
