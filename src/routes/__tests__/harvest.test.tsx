import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HarvestPage } from '../../components/harvest-page'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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
  fetchHarvests: vi.fn().mockResolvedValue([]),
  addHarvest: vi.fn().mockResolvedValue({}),
  deleteHarvest: vi.fn().mockResolvedValue(undefined),
}))

describe('Harvest Log Form', () => {
  it('renders the harvest page heading', () => {
    renderWithQueryClient(<HarvestPage />)
    expect(screen.getByRole('heading', { name: /harvest logging/i })).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderWithQueryClient(<HarvestPage />)
    expect(screen.getByLabelText(/crop type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quality grade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/field id/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderWithQueryClient(<HarvestPage />)
    expect(screen.getByRole('button', { name: /log harvest/i })).toBeInTheDocument()
  })

  it('has correct default values for select fields', () => {
    renderWithQueryClient(<HarvestPage />)
    expect(screen.getByLabelText(/crop type/i)).toHaveValue('')
    expect(screen.getByLabelText(/quality grade/i)).toHaveValue('')
  })
})
