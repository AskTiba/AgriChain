import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { LogisticsPage } from '../../components/logistics-page'

vi.mock('~/app/server/harvests', () => ({
  fetchHarvests: vi.fn().mockResolvedValue([
    { id: 'h1', cropType: 'Tomatoes', qualityGrade: 'A', quantity: 450, fieldId: 'Field A', timestamp: new Date().toISOString() },
    { id: 'h2', cropType: 'Maize', qualityGrade: 'A', quantity: 1200, fieldId: 'Field B', timestamp: new Date().toISOString() },
  ]),
  addHarvest: vi.fn().mockResolvedValue({}),
  deleteHarvest: vi.fn().mockResolvedValue(undefined),
}))

describe('Logistics Flow Integration', () => {
  it('renders all logistics sections with empty states', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.getByText('No warehouse data available.')).toBeInTheDocument()
    expect(screen.getByText('No vehicles registered yet.')).toBeInTheDocument()
  })

  it('allows adding a vehicle via the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LogisticsPage />)

    await user.type(screen.getByLabelText(/vehicle name/i), 'Truck A')
    await user.type(screen.getByLabelText(/payload/i), '5000')
    await user.type(screen.getByLabelText(/driver name/i), 'John Doe')
    await user.type(screen.getByLabelText(/destination/i), 'Market East')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Truck A').length).toBeGreaterThan(1)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('shows harvests from DB and allows assignment', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LogisticsPage />)

    expect(await screen.findByText('Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('Maize')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/vehicle name/i), 'Truck A')
    await user.type(screen.getByLabelText(/payload/i), '5000')
    await user.type(screen.getByLabelText(/driver name/i), 'John Doe')
    await user.type(screen.getByLabelText(/destination/i), 'Market East')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Truck A').length).toBeGreaterThan(1)
    })

    const assignButtons = screen.getAllByRole('button', { name: /truck a/i })
    await user.click(assignButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Share Manifest')).toBeInTheDocument()
    })
  })

  it('shows no manifest before any assignment', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.queryByText('Share Manifest')).not.toBeInTheDocument()
  })
})
