import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { Logistics } from '../logistics'

describe('Logistics Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all logistics sections', () => {
    renderWithProviders(<Logistics />)

    expect(screen.getByText('Warehouse A')).toBeInTheDocument()
    expect(screen.getAllByText('Truck A').length).toBeGreaterThan(0)
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })

  it('renders initial vehicles in ledger', () => {
    renderWithProviders(<Logistics />)

    expect(screen.getAllByText('Truck A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Truck B').length).toBeGreaterThan(0)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows all unassigned harvests', () => {
    renderWithProviders(<Logistics />)

    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('Maize')).toBeInTheDocument()
    expect(screen.getByText('Beans')).toBeInTheDocument()
    expect(screen.getByText('Cabbage')).toBeInTheDocument()
  })

  it('assigns harvest to vehicle and generates manifest', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Logistics />)

    const assignButtons = screen.getAllByRole('button', { name: /truck a/i })
    await user.click(assignButtons[0])

    expect(screen.getByText('Share Manifest')).toBeInTheDocument()
    expect(screen.getByText('Copy Manifest Link')).toBeInTheDocument()
  })

  it('shows no manifest before any assignment', () => {
    renderWithProviders(<Logistics />)

    expect(screen.queryByText('Share Manifest')).not.toBeInTheDocument()
    expect(screen.queryByText('Copy Manifest Link')).not.toBeInTheDocument()
  })
})
