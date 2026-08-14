import { createFileRoute } from '@tanstack/react-router'
import { WarehouseCapacity } from '../components/warehouse-capacity'

export const Route = createFileRoute('/logistics')({
  component: Logistics,
})

const MOCK_WAREHOUSES = [
  { id: 'W1', name: 'Warehouse A', used: 780, total: 1000 },
  { id: 'W2', name: 'Warehouse B', used: 450, total: 1000 },
  { id: 'W3', name: 'Warehouse C', used: 920, total: 1000 },
  { id: 'W4', name: 'Warehouse D', used: 310, total: 1000 },
]

function Logistics() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw + 0.75rem, 3rem)' }}
        >
          Logistics & Transport
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
          Match harvest batches to vehicles, manage driver assignments, and share logistics manifests.
        </p>
      </section>

      <section aria-label="Warehouse capacity" className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
          Warehouse Capacity
        </h2>
        <WarehouseCapacity warehouses={MOCK_WAREHOUSES} />
      </section>

      <section
        aria-label="Vehicle ledger"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          Active Vehicles
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Drag-and-drop shipment assignment will be built here.
        </p>
      </section>
    </div>
  )
}