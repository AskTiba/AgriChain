import { createFileRoute } from '@tanstack/react-router'
import { useOrders } from '~/app/hooks/use-orders'
import { useHarvests } from '~/app/hooks/use-harvests'
import { useUpdateOrderStatus } from '~/app/hooks/use-orders'

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: harvests = [] } = useHarvests()
  const updateOrderStatus = useUpdateOrderStatus()

  const getHarvestInfo = (harvestId: string) => {
    return harvests.find((h) => h.id === harvestId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
      case 'confirmed':
        return 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
      case 'delivered':
        return 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
      default:
        return 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: 'pending' | 'confirmed' | 'delivered') => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus })
  }

  if (ordersLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface)]" />
          <div className="h-64 rounded-lg bg-[var(--color-surface)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Orders
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Track and manage your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">
            No orders yet. Browse available harvests to place your first order.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[var(--color-surface)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Quantity
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text)]">
                      {harvest?.cropType || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text)]">
                      {order.quantity} kg
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="cursor-pointer rounded-lg bg-[var(--color-info)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--color-info)]/80"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="cursor-pointer rounded-lg bg-[var(--color-success)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--color-success)]/80"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
