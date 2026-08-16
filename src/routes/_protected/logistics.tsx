import { createFileRoute } from '@tanstack/react-router'
import { LogisticsPage } from '~/components/logistics-page'

export const Route = createFileRoute('/_protected/logistics')({
  component: LogisticsPage,
})
