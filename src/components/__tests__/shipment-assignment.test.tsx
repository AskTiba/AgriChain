import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShipmentAssignment } from '../../components/shipment-assignment'

const mockHarvests = [
  { id: 'H1', cropType: 'maize', quantity: 500, fieldId: 'F-001' },
  { id: 'H2', cropType: 'wheat', quantity: 300, fieldId: 'F-002' },
]

const mockVehicles = [
  { id: 'V1', name: 'Truck A', payload: 5000, driver: 'John Doe', destination: 'Market East' },
  { id: 'V2', name: 'Truck B', payload: 3000, driver: 'Jane Smith', destination: 'Warehouse North' },
]

const mockAssigned = [
  { harvestId: 'H1', vehicleId: 'V1' },
]

describe('ShipmentAssignment', () => {
  it('renders unassigned harvest entries', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    expect(screen.getByText('maize')).toBeInTheDocument()
    expect(screen.getByText('wheat')).toBeInTheDocument()
  })

  it('renders available vehicles for assignment', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    expect(screen.getAllByText('Truck A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Truck B').length).toBeGreaterThan(0)
  })

  it('shows assign button for each unassigned harvest', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    const assignButtons = screen.getAllByRole('button')
    expect(assignButtons.length).toBe(4)
  })

  it('calls onAssign with harvest and vehicle IDs', async () => {
    const user = userEvent.setup()
    const onAssign = vi.fn()
    render(
      <ShipmentAssignment
        harvests={[mockHarvests[0]]}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={onAssign}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Truck A' }))

    expect(onAssign).toHaveBeenCalledWith('H1', 'V1')
  })

  it('hides assigned harvests from unassigned list', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={mockAssigned}
        onAssign={() => {}}
      />
    )

    expect(screen.queryByText('maize')).not.toBeInTheDocument()
    expect(screen.getByText('wheat')).toBeInTheDocument()
  })

  it('shows empty state when all harvests assigned', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={[{ harvestId: 'H1', vehicleId: 'V1' }, { harvestId: 'H2', vehicleId: 'V2' }]}
        onAssign={() => {}}
      />
    )

    expect(screen.getByText(/all harvests assigned/i)).toBeInTheDocument()
  })
})