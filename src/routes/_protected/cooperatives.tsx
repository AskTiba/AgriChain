import { createFileRoute } from '@tanstack/react-router'
import { CooperativesPage } from '~/components/cooperatives-page'

export const Route = createFileRoute('/_protected/cooperatives')({
  component: CooperativesPage,
})
