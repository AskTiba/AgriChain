import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { BuyerPage } from '../buyer'

describe('Buyer Order Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('displays harvest cards from seed data', () => {
    renderWithProviders(<BuyerPage />)

    expect(screen.getByText('Maize')).toBeInTheDocument()
    expect(screen.getByText('Beans')).toBeInTheDocument()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })

  it('places an order end-to-end', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyerPage />)

    const orderButtons = screen.getAllByRole('button', { name: /order now/i })
    await user.click(orderButtons[0])

    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

    const input = screen.getByLabelText(/quantity/i)
    await user.clear(input)
    await user.type(input, '25')

    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument()
    })

    const stored = JSON.parse(localStorage.getItem('agri-tech-orders') || '[]')
    const newOrder = stored.find((o: { harvestId: string; quantity: number }) => o.quantity === 25)
    expect(newOrder).toBeDefined()
    expect(newOrder.status).toBe('pending')
  })

  it('cancels order and resets form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyerPage />)

    const orderButtons = screen.getAllByRole('button', { name: /order now/i })
    await user.click(orderButtons[0])
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument()
    const orderButtonsAfterCancel = screen.getAllByRole('button', { name: /order now/i })
    expect(orderButtonsAfterCancel.length).toBeGreaterThan(0)
  })

  it('disables Place Order when quantity is invalid', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyerPage />)

    const orderButtons = screen.getAllByRole('button', { name: /order now/i })
    await user.click(orderButtons[0])

    const input = screen.getByLabelText(/quantity/i)
    await user.clear(input)
    await user.type(input, '0')

    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled()
  })
})
