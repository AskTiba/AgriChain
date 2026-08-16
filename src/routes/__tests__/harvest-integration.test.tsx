import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HarvestPage } from '../../components/harvest-page'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

vi.mock('~/app/server/harvests', () => ({
  fetchHarvests: vi.fn().mockResolvedValue([
    { id: 'h1', cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001', timestamp: new Date().toISOString() },
  ]),
  addHarvest: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve({
      id: 'new-h1',
      ...data,
      timestamp: new Date().toISOString(),
    })
  ),
  deleteHarvest: vi.fn().mockResolvedValue(undefined),
}))

describe('Harvest Page Integration', () => {
  it('shows harvest list when data exists', async () => {
    renderWithQueryClient(<HarvestPage />)

    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })
  })

  it('submits a new harvest entry successfully', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.type(screen.getByLabelText(/field id/i), 'F-001')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    await waitFor(() => {
      expect(screen.getByText(/harvest entry logged successfully/i)).toBeInTheDocument()
    })
  })
})
