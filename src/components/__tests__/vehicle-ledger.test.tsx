import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VehicleLedger } from '../../components/vehicle-ledger'

const mockVehicles = [
  { id: 'V1', name: 'Truck A', payload: 5000, driver: 'John Doe', destination: 'Market East' },
  { id: 'V2', name: 'Truck B', payload: 3000, driver: 'Jane Smith', destination: 'Warehouse North' },
]

describe('VehicleLedger', () => {
  it('renders table headers', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Payload')).toBeInTheDocument()
    expect(screen.getByText('Driver')).toBeInTheDocument()
    expect(screen.getAllByText('Destination').length).toBeGreaterThan(0)
  })

  it('renders vehicle data', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('5000 kg')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Market East')).toBeInTheDocument()
  })

  it('renders all vehicles', () => {
    render(<VehicleLedger vehicles={mockVehicles} onAdd={() => {}} />)

    expect(screen.getByText('Truck A')).toBeInTheDocument()
    expect(screen.getByText('Truck B')).toBeInTheDocument()
  })

  it('shows empty state when no vehicles', () => {
    render(<VehicleLedger vehicles={[]} onAdd={() => {}} />)

    expect(screen.getByText(/no vehicles registered/i)).toBeInTheDocument()
  })

  it('renders add vehicle form', () => {
    render(<VehicleLedger vehicles={[]} onAdd={() => {}} />)

    expect(screen.getByLabelText(/vehicle name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/payload capacity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/driver name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
  })

  it('calls onAdd with form values when submitted', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<VehicleLedger vehicles={[]} onAdd={onAdd} />)

    await user.type(screen.getByLabelText(/vehicle name/i), 'Truck C')
    await user.type(screen.getByLabelText(/payload capacity/i), '4000')
    await user.type(screen.getByLabelText(/driver name/i), 'Bob Wilson')
    await user.type(screen.getByLabelText(/destination/i), 'Market South')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))

    expect(onAdd).toHaveBeenCalledWith({
      name: 'Truck C',
      payload: 4000,
      driver: 'Bob Wilson',
      destination: 'Market South',
    })
  })
})