import { createFileRoute } from '@tanstack/react-router'
import { BuyerPage } from '~/components/buyer-page'

export const Route = createFileRoute('/buyer')({
  component: BuyerPage,
})
