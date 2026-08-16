import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShipmentAssignment } from '../../components/shipment-assignment'

const mockHarvests = [
  { id: 'H1', cropType: 'maize', quantity: 500, fieldId: 'F-001' },
  { id: 'H2', cropType: 'wheat', quantity: 300, fieldId: 'F-002' },
]

const mockVehicles = [
  { id: 'V1', name: 'Truck A' },
  { id: 'V2', name: 'Blue Pickup' },
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

  it('shows assign button for each unassigned harvest', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    const assignButtons = screen.getAllByRole('button', { name: /assign/i })
    expect(assignButtons.length).toBe(2)
  })

  it('expands inline form when assign is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ShipmentAssignment
        harvests={[mockHarvests[0]]}
        vehicles={mockVehicles}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: /assign/i }))

    expect(screen.getByLabelText(/driver name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm assignment/i })).toBeInTheDocument()
  })

  it('calls onAssign with all fields when confirmed', async () => {
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

    await user.click(screen.getByRole('button', { name: /assign/i }))
    await user.type(screen.getByLabelText(/driver name/i), 'John Doe')
    await user.type(screen.getByLabelText(/destination/i), 'Market East')
    await user.click(screen.getByRole('button', { name: /confirm assignment/i }))

    expect(onAssign).toHaveBeenCalledWith('H1', 'V1', 'John Doe', 'Market East')
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

  it('shows message to add vehicle first when no vehicles', () => {
    render(
      <ShipmentAssignment
        harvests={mockHarvests}
        vehicles={[]}
        assigned={[]}
        onAssign={() => {}}
      />
    )

    expect(screen.getByText(/add a vehicle first/i)).toBeInTheDocument()
  })
})
