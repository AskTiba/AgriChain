import { createFileRoute, Link } from '@tanstack/react-router'
import { useOrderByOrderNumber, useConfirmOrder, useAssignDriver, useUpdateOrderStatus } from '~/app/hooks/use-orders'
import { useHarvests } from '~/app/hooks/use-harvests'
import { useCurrentUser } from '~/app/hooks/use-auth'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/orders/$orderNumber')({
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { orderNumber } = Route.useParams()
  const { data: order, isLoading: orderLoading } = useOrderByOrderNumber(orderNumber)
  const { data: harvests = [] } = useHarvests()
  const { data: currentUser } = useCurrentUser()
  const confirmOrder = useConfirmOrder()
  const assignDriver = useAssignDriver()
  const updateOrderStatus = useUpdateOrderStatus()
  const [driverName, setDriverName] = useState('')

  const harvest = order ? harvests.find((h) => h.id === order.harvestId) : null
  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager'
  const isDriver = currentUser?.role === 'driver'

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

  if (orderLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface)]" />
          <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
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

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
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
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="space-y-4">
          {/* Harvest Information */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
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

          {/* Order Details */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
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

          {/* Fulfillment Actions — Manager */}
          {isManager && order.status === 'pending' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-warning)]">
                Awaiting Confirmation
              </h2>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Confirm this order to begin fulfillment.
              </p>
              <button
                type="button"
                onClick={() => confirmOrder.mutate(order.id)}
                disabled={confirmOrder.isPending}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-info)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-info)]/80 disabled:opacity-50"
              >
                Confirm Order
              </button>
            </div>
          )}

          {isManager && order.status === 'confirmed' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-info)]">
                Awaiting Driver Assignment
              </h2>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Assign a driver to dispatch this order.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="min-h-[44px] w-48 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!driverName.trim()) return
                    assignDriver.mutate({ id: order.id, driverId: currentUser?.id || '' })
                    setDriverName('')
                  }}
                  disabled={assignDriver.isPending || !driverName.trim()}
                  className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  Assign Driver
                </button>
              </div>
              <Link
                to="/logistics"
                className="mt-3 inline-block cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View Logistics →
              </Link>
            </div>
          )}

          {isManager && order.status === 'in-transit' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-accent)]">
                In Transit
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                This order is on its way to the buyer.
              </p>
            </div>
          )}

          {/* Fulfillment Actions — Driver */}
          {isDriver && order.status === 'confirmed' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-info)]">
                Ready for Pickup
              </h2>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Start delivery to mark this order as in transit.
              </p>
              <button
                type="button"
                onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'in-transit' })}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent)]/80"
              >
                Start Delivery
              </button>
            </div>
          )}

          {(isManager || isDriver) && order.status === 'in-transit' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-accent)]">
                Out for Delivery
              </h2>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Mark as delivered once the order reaches the buyer.
              </p>
              <button
                type="button"
                onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'delivered' })}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-success)]/80"
              >
                Mark Delivered
              </button>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-4">
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
