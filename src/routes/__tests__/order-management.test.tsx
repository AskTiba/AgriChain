import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { OrdersPage } from '../../components/orders-page'

const { mockFetchOrders, mockUpdateOrderStatus } = vi.hoisted(() => {
  const orders = [
    { id: '550e8400-e29b-41d4-a716-446655440001', orderNumber: 'ORD-000001', harvestId: 'h1', buyerId: 'buyer-001', quantity: 100, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '550e8400-e29b-41d4-a716-446655440002', orderNumber: 'ORD-000002', harvestId: 'h2', buyerId: 'buyer-001', quantity: 50, status: 'confirmed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '550e8400-e29b-41d4-a716-446655440003', orderNumber: 'ORD-000003', harvestId: 'h3', buyerId: 'buyer-002', quantity: 75, status: 'delivered', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]
  return {
    mockFetchOrders: vi.fn().mockImplementation(() => Promise.resolve(orders.map(o => ({ ...o })))),
    mockUpdateOrderStatus: vi.fn().mockImplementation(({ data }: { data: { id: string; status: string } }) => {
      const order = orders.find(o => o.id === data.id)
      if (order) order.status = data.status as typeof order.status
      return Promise.resolve({ id: data.id, status: data.status })
    }),
  }
})

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
  fetchOrders: mockFetchOrders,
  fetchOrdersByBuyer: vi.fn().mockResolvedValue([]),
  fetchOrderByOrderNumber: vi.fn().mockResolvedValue(undefined),
  addOrder: vi.fn().mockResolvedValue({}),
  updateOrderStatus: mockUpdateOrderStatus,
  deleteOrder: vi.fn().mockResolvedValue(undefined),
}))

describe('Order Management Integration', () => {
  it('renders orders table with seed data', async () => {
    renderWithProviders(<OrdersPage />)
    await waitFor(() => {
      expect(screen.getByText('ORD-000001')).toBeInTheDocument()
    })
    expect(screen.getByText('ORD-000002')).toBeInTheDocument()
    expect(screen.getByText('ORD-000003')).toBeInTheDocument()
  })

  it('shows correct action buttons per status', async () => {
    renderWithProviders(<OrdersPage />)
    await waitFor(() => {
      expect(screen.getByText('ORD-000001')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark delivered/i })).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('transitions pending order to confirmed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText('ORD-000001')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument()
    })

    const deliveredButtons = screen.getAllByRole('button', { name: /mark delivered/i })
    expect(deliveredButtons.length).toBe(2)
  })

  it('displays crop names from harvest data', async () => {
    renderWithProviders(<OrdersPage />)
    await waitFor(() => {
      expect(screen.getByText('Maize')).toBeInTheDocument()
    })
    expect(screen.getByText('Beans')).toBeInTheDocument()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })
})
