import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { BuyerPage } from '../../components/buyer-page'

vi.mock('~/app/server/harvests', () => ({
  fetchHarvests: vi.fn().mockResolvedValue([
    { id: 'h1', cropType: 'Maize', qualityGrade: 'A', quantity: 500, fieldId: 'FIELD-001', timestamp: new Date().toISOString() },
    { id: 'h2', cropType: 'Beans', qualityGrade: 'B', quantity: 200, fieldId: 'FIELD-002', timestamp: new Date().toISOString() },
    { id: 'h3', cropType: 'Tomatoes', qualityGrade: 'A', quantity: 150, fieldId: 'FIELD-003', timestamp: new Date().toISOString() },
  ]),
  addHarvest: vi.fn().mockResolvedValue({}),
  deleteHarvest: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('~/app/server/orders', () => ({
  fetchOrders: vi.fn().mockResolvedValue([]),
  fetchOrdersByBuyer: vi.fn().mockResolvedValue([]),
  fetchOrderByOrderNumber: vi.fn().mockResolvedValue(undefined),
  addOrder: vi.fn().mockResolvedValue({
    id: crypto.randomUUID(), orderNumber: 'ORD-000001', status: 'pending',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }),
  updateOrderStatus: vi.fn().mockResolvedValue({}),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
}))

describe('Buyer Order Flow Integration', () => {
  it('displays harvest cards from seed data', async () => {
    renderWithProviders(<BuyerPage />)
    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })
    expect(screen.getByText('Beans')).toBeInTheDocument()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })

  it('places an order end-to-end', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyerPage />)

    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })

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
  })

  it('cancels order and resets form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BuyerPage />)

    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })

    const orderButtons = screen.getAllByRole('button', { name: /order now/i })
    await user.click(orderButtons[0])

    const input = screen.getByLabelText(/quantity/i)
    await user.clear(input)
    await user.type(input, '0')

    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled()
  })
})
