import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { OrdersPage } from '../orders/index'

describe('Order Management Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders orders table with seed data', () => {
    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('ORD-000001')).toBeInTheDocument()
    expect(screen.getByText('ORD-000002')).toBeInTheDocument()
    expect(screen.getByText('ORD-000003')).toBeInTheDocument()
  })

  it('shows correct action buttons per status', () => {
    renderWithProviders(<OrdersPage />)

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark delivered/i })).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('transitions pending order to confirmed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrdersPage />)

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument()
    })

    const deliveredButtons = screen.getAllByRole('button', { name: /mark delivered/i })
    expect(deliveredButtons.length).toBe(2)

    const stored = JSON.parse(localStorage.getItem('agri-tech-orders') || '[]')
    const order = stored.find((o: { orderNumber: string }) => o.orderNumber === 'ORD-000001')
    expect(order.status).toBe('confirmed')
  })

  it('transitions confirmed order to delivered', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrdersPage />)

    await user.click(screen.getByRole('button', { name: /mark delivered/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /mark delivered/i })).not.toBeInTheDocument()
    })

    const stored = JSON.parse(localStorage.getItem('agri-tech-orders') || '[]')
    const order = stored.find((o: { orderNumber: string }) => o.orderNumber === 'ORD-000002')
    expect(order.status).toBe('delivered')
  })

  it('displays crop names from harvest data', () => {
    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('Maize')).toBeInTheDocument()
    expect(screen.getByText('Beans')).toBeInTheDocument()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })
})
