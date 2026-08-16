import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useOrders, useConfirmOrder, useAssignDriver, useUpdateOrderStatus } from '~/app/hooks/use-orders'
import { useHarvests } from '~/app/hooks/use-harvests'
import { useCurrentUser } from '~/app/hooks/use-auth'

export function OrdersPage() {
  const { data: orders = [], isFetching } = useOrders()
  const { data: harvests = [] } = useHarvests()
  const { data: currentUser } = useCurrentUser()
  const confirmOrder = useConfirmOrder()
  const assignDriver = useAssignDriver()
  const updateOrderStatus = useUpdateOrderStatus()

  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const [driverName, setDriverName] = useState('')

  const getHarvestInfo = (harvestId: string | null) => {
    if (!harvestId) return null
    return harvests.find((h) => h.id === harvestId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
      case 'confirmed':
        return 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
      case 'in-transit':
        return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
      case 'delivered':
        return 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'In Transit'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager'
  const isDriver = currentUser?.role === 'driver'

  const handleConfirm = (orderId: string) => {
    confirmOrder.mutate(orderId)
  }

  const handleAssignDriver = (orderId: string) => {
    if (!driverName.trim()) return
    assignDriver.mutate({ id: orderId, driverId: currentUser?.id || '' })
    setAssigningOrderId(null)
    setDriverName('')
  }

  const handleMarkInTransit = (orderId: string) => {
    updateOrderStatus.mutate({ id: orderId, status: 'in-transit' })
  }

  const handleMarkDelivered = (orderId: string) => {
    updateOrderStatus.mutate({ id: orderId, status: 'delivered' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1
          className="font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Orders
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">
          {isManager
            ? 'Manage incoming orders, confirm, and assign drivers'
            : isDriver
              ? 'View your assigned deliveries and update status'
              : 'Track your order status'}
        </p>
      </section>

      {isFetching && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <span className="text-sm text-[var(--color-text-muted)]">Refreshing orders...</span>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">
            No orders yet. Browse available harvests to place your first order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status summary */}
          <div className="grid gap-4 sm:grid-cols-4">
            {(['pending', 'confirmed', 'in-transit', 'delivered'] as const).map((status) => (
              <div
                key={status}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-[var(--color-text-muted)]">{getStatusLabel(status)}</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {orders.filter((o) => o.status === status).length}
                </p>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
            <table className="min-w-full divide-y divide-[var(--color-border)]" aria-label="Orders">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((order) => {
                  const harvest = getHarvestInfo(order.harvestId)
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-[var(--color-surface)]">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link
                          to="/orders/$orderNumber"
                          params={{ orderNumber: order.orderNumber }}
                          className="cursor-pointer font-mono text-xs text-[var(--color-primary)] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text)]">
                        {harvest?.cropType || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text)]">
                        {order.quantity} kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {/* Manager: Confirm pending orders */}
                          {isManager && order.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleConfirm(order.id)}
                              disabled={confirmOrder.isPending}
                              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-info)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-info)]/80 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Manager: Assign driver to confirmed orders */}
                          {isManager && order.status === 'confirmed' && !order.assignedDriverId && (
                            assigningOrderId === order.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Driver name"
                                  value={driverName}
                                  onChange={(e) => setDriverName(e.target.value)}
                                  className="w-32 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-xs text-[var(--color-text)]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAssignDriver(order.id)}
                                  className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-2 py-1 text-xs font-medium text-[var(--color-primary-foreground)]"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setAssigningOrderId(null); setDriverName('') }}
                                  className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-muted)]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAssigningOrderId(order.id)}
                                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/5 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                              >
                                Assign Driver
                              </button>
                            )
                          )}

                          {/* Manager/Driver: Mark in-transit */}
                          {(isManager || isDriver) && order.status === 'confirmed' && order.assignedDriverId && (
                            <button
                              type="button"
                              onClick={() => handleMarkInTransit(order.id)}
                              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent)]/80"
                            >
                              Mark In Transit
                            </button>
                          )}

                          {/* Driver: Mark delivered */}
                          {(isManager || isDriver) && order.status === 'in-transit' && (
                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(order.id)}
                              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-success)]/80"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
