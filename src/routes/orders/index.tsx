import { createFileRoute, Link } from '@tanstack/react-router'
import { useOrders } from '~/app/hooks/use-orders'
import { useHarvests } from '~/app/hooks/use-harvests'
import { useUpdateOrderStatus } from '~/app/hooks/use-orders'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

function OrdersPage() {
  const { data: orders = [], isFetching } = useOrders()
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
          Track and manage your orders
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
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--color-border)]" aria-label="Orders">
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
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-lg)] bg-[var(--color-info)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-info)]/80"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-lg)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-success)]/80"
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
