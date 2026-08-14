import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WarehouseCapacity } from '../../components/warehouse-capacity'

const mockWarehouses = [
  { id: 'W1', name: 'Main Storage', used: 400, total: 1000 },
  { id: 'W2', name: 'Cold Storage', used: 750, total: 1000 },
  { id: 'W3', name: 'Overflow', used: 950, total: 1000 },
]

describe('WarehouseCapacity', () => {
  it('renders warehouse names', () => {
    render(<WarehouseCapacity warehouses={mockWarehouses} />)

    expect(screen.getByText('Main Storage')).toBeInTheDocument()
    expect(screen.getByText('Cold Storage')).toBeInTheDocument()
    expect(screen.getByText('Overflow')).toBeInTheDocument()
  })

  it('displays capacity percentages', () => {
    render(<WarehouseCapacity warehouses={mockWarehouses} />)

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('displays used/total values', () => {
    render(<WarehouseCapacity warehouses={mockWarehouses} />)

    expect(screen.getByText('400 / 1000 kg')).toBeInTheDocument()
    expect(screen.getByText('750 / 1000 kg')).toBeInTheDocument()
    expect(screen.getByText('950 / 1000 kg')).toBeInTheDocument()
  })

  it('applies correct color class for low capacity', () => {
    render(<WarehouseCapacity warehouses={[mockWarehouses[0]]} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '40')
    expect(progressbar.querySelector('[data-status="low"]')).toBeInTheDocument()
  })

  it('applies correct color class for medium capacity', () => {
    render(<WarehouseCapacity warehouses={[mockWarehouses[1]]} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '75')
    expect(progressbar.querySelector('[data-status="medium"]')).toBeInTheDocument()
  })

  it('applies correct color class for high capacity', () => {
    render(<WarehouseCapacity warehouses={[mockWarehouses[2]]} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '95')
    expect(progressbar.querySelector('[data-status="high"]')).toBeInTheDocument()
  })

  it('has accessible progressbar with correct aria attributes', () => {
    render(<WarehouseCapacity warehouses={[mockWarehouses[0]]} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '40')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-label', 'Main Storage capacity')
  })

  it('shows empty state when no warehouses', () => {
    render(<WarehouseCapacity warehouses={[]} />)

    expect(screen.getByText(/no warehouse data/i)).toBeInTheDocument()
  })
})