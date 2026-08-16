import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/test-utils'
import { LogisticsPage } from '../../components/logistics-page'

vi.mock('~/app/hooks/use-harvests', () => ({
  useHarvests: () => ({
    data: [
      { id: 'h1', cropType: 'Tomatoes', qualityGrade: 'A', quantity: 450, fieldId: 'Field A', timestamp: new Date().toISOString() },
      { id: 'h2', cropType: 'Maize', qualityGrade: 'A', quantity: 1200, fieldId: 'Field B', timestamp: new Date().toISOString() },
    ],
    isLoading: false,
  }),
}))

vi.mock('~/app/hooks/use-vehicles', () => ({
  useVehicles: () => ({
    data: [
      { id: 'v1', name: 'Truck A', type: 'truck', plateNumber: 'KCA 123B', payloadCapacity: 5000, status: 'available' },
    ],
    isLoading: false,
  }),
  useAddVehicle: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('~/app/hooks/use-assignments', () => ({
  useAssignments: () => ({
    data: [],
    isLoading: false,
  }),
  useAddAssignment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

describe('Logistics Flow Integration', () => {
  it('renders all logistics sections', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.getByText('No warehouse data available.')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Ledger')).toBeInTheDocument()
    expect(screen.getByText('Assign Shipments')).toBeInTheDocument()
  })

  it('shows harvests from DB', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('Maize')).toBeInTheDocument()
  })

  it('shows no manifest before any assignment', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.queryByText('Share Manifest')).not.toBeInTheDocument()
  })

  it('shows add vehicle form', () => {
    renderWithProviders(<LogisticsPage />)

    expect(screen.getByLabelText(/vehicle name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/payload capacity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
  })
})
