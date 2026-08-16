import { useHarvests } from '~/app/hooks/use-harvests'
import { useAddOrder } from '~/app/hooks/use-orders'
import { useState } from 'react'

export function BuyerPage() {
  const { data: harvests = [], isFetching } = useHarvests()
  const addOrder = useAddOrder()
  const [selectedHarvest, setSelectedHarvest] = useState<string | null>(null)
  const [orderQuantity, setOrderQuantity] = useState<number>(0)

  const handlePlaceOrder = (harvestId: string) => {
    const harvest = harvests.find((h) => h.id === harvestId)
    if (!harvest || orderQuantity <= 0 || orderQuantity > harvest.quantity) return

    addOrder.mutate({
      harvestId,
      quantity: orderQuantity,
    })

    setSelectedHarvest(null)
    setOrderQuantity(0)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1
          className="font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Available Harvests
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">
          Browse and order fresh produce from local cooperatives
        </p>
      </section>

      {isFetching && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <span className="text-sm text-[var(--color-text-muted)]">Refreshing harvests...</span>
          </div>
        </div>
      )}

      {harvests.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">
            No harvests available at the moment
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {harvests.map((harvest) => (
            <div
              key={harvest.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
                    {harvest.cropType}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Field: {harvest.fieldId}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                  {harvest.qualityGrade}
                </span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Available</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {harvest.quantity} kg
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Logged</span>
                  <span className="text-[var(--color-text)]">
                    {new Date(harvest.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedHarvest === harvest.id ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`qty-${harvest.id}`} className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]">
                      Quantity (kg)
                    </label>
                    <input
                      id={`qty-${harvest.id}`}
                      type="number"
                      min={1}
                      max={harvest.quantity}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      className="w-full min-h-[44px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlaceOrder(harvest.id)}
                      disabled={orderQuantity <= 0 || orderQuantity > harvest.quantity}
                      className="flex-1 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Place Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHarvest(null)
                        setOrderQuantity(0)
                      }}
                      className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHarvest(harvest.id)
                    setOrderQuantity(Math.min(10, harvest.quantity))
                  }}
                  className="w-full inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-primary)] bg-[var(--color-primary)]/5 px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                >
                  Order Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
