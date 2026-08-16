import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('Harvest Form Validation', () => {
  it('shows error when crop type is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/crop type is required/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/crop type/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows error when quality grade is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/quality grade is required/i)).toBeInTheDocument()
  })

  it('shows error when quantity is zero', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument()
  })

  it('shows error when field ID is empty', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    await user.selectOptions(screen.getByLabelText(/quality grade/i), 'A')
    await user.type(screen.getByLabelText(/quantity/i), '500')
    await user.click(screen.getByRole('button', { name: /log harvest/i }))

    expect(screen.getByText(/field id is required/i)).toBeInTheDocument()
  })

  it('clears error when user selects a crop type', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<HarvestPage />)

    await user.click(screen.getByRole('button', { name: /log harvest/i }))
    expect(screen.getByText(/crop type is required/i)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/crop type/i), 'maize')
    expect(screen.queryByText(/crop type is required/i)).not.toBeInTheDocument()
  })
})
