import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VehicleLedger } from '../../components/vehicle-ledger'

const mockVehicles = [
  { id: 'V1', name: 'Truck A', type: 'truck', plateNumber: 'KCA 123B', payloadCapacity: 5000, status: 'available' },
  { id: 'V2', name: 'Blue Pickup', type: 'pickup', plateNumber: null, payloadCapacity: 3000, status: 'in-use' },
]

describe('VehicleLedger', () => {
  it('renders table headers', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Capacity')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders vehicle data', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('5000 kg')).toBeInTheDocument()
    expect(screen.getByText('KCA 123B')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('renders all vehicles', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('Blue Pickup')).toBeInTheDocument()
  })

  it('shows empty state when no vehicles', () => {
    render(<VehicleLedger vehicles={[]} onAdd={() => {}} />)

    expect(screen.getByText(/no vehicles registered/i)).toBeInTheDocument()
  })

  it('renders add vehicle form', () => {
    render(<VehicleLedger vehicles={[]} onAdd={() => {}} />)

    expect(screen.getByLabelText(/vehicle name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/payload capacity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
  })

  it('calls onAdd with form values when submitted', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<VehicleLedger vehicles={[]} onAdd={onAdd} />)

    await user.type(screen.getByLabelText(/vehicle name/i), 'Truck C')
    await user.type(screen.getByLabelText(/payload capacity/i), '4000')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))

    expect(onAdd).toHaveBeenCalledWith({
      name: 'Truck C',
      type: 'truck',
      plateNumber: null,
      payloadCapacity: 4000,
    })
  })
})
