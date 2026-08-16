import { createFileRoute } from '@tanstack/react-router'
import { HarvestPage } from '~/components/harvest-page'

export const Route = createFileRoute('/harvest')({
  component: HarvestPage,
})
