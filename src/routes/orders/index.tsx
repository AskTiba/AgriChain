import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '~/components/orders-page'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})
