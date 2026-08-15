import { createFileRoute, Link } from '@tanstack/react-router'
import { useOrderByOrderNumber } from '~/app/hooks/use-orders'
import { useHarvests } from '~/app/hooks/use-harvests'

export const Route = createFileRoute('/orders/$orderNumber')({
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { orderNumber } = Route.useParams()
  const { data: order, isLoading: orderLoading } = useOrderByOrderNumber(orderNumber)
  const { data: harvests = [] } = useHarvests()

  const harvest = order ? harvests.find((h) => h.id === order.harvestId) : null

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

  if (orderLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface)]" />
          <div className="h-64 rounded-lg bg-[var(--color-surface)]" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">
            Order not found
          </p>
          <Link
            to="/orders"
            className="mt-4 inline-block cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/orders"
          className="cursor-pointer text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Order Details
            </h1>
            <p className="mt-1 font-mono text-sm text-[var(--color-text-muted)]">
              {order.orderNumber}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              Harvest Information
            </h2>
            {harvest ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Crop Type</span>
                  <span className="font-medium text-[var(--color-text)]">{harvest.cropType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Quality Grade</span>
                  <span className="font-medium text-[var(--color-text)]">{harvest.qualityGrade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Field ID</span>
                  <span className="font-medium text-[var(--color-text)]">{harvest.fieldId}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Harvest information unavailable
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              Order Details
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Quantity</span>
                <span className="font-medium text-[var(--color-text)]">{order.quantity} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Order Date</span>
                <span className="text-[var(--color-text)]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Last Updated</span>
                <span className="text-[var(--color-text)]">
                  {new Date(order.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {order.status === 'confirmed' && (
            <div className="rounded-lg border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-info)]">
                Shipment Status
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                This order is confirmed and awaiting delivery.
              </p>
              <Link
                to="/logistics"
                className="mt-3 inline-block cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View Logistics →
              </Link>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-success)]">
                Delivery Complete
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                This order has been delivered successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
