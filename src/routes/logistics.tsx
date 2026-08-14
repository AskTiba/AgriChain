import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/logistics')({
  component: Logistics,
})

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <CapacityCard name="Warehouse A" capacity={78} />
          <CapacityCard name="Warehouse B" capacity={45} />
          <CapacityCard name="Warehouse C" capacity={92} />
          <CapacityCard name="Warehouse D" capacity={31} />
        </div>
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

function CapacityCard({ name, capacity }: { name: string; capacity: number }) {
  const isHigh = capacity >= 85
  const barColor = isHigh ? 'var(--color-danger)' : 'var(--color-primary)'

  return (
    <div
      className="animate-fade-in-up rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      role="article"
      aria-label={`${name}: ${capacity}% full`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {name}
        </span>
        {isHigh && (
          <span className="rounded-full bg-[var(--color-danger)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
            Nearly Full
          </span>
        )}
      </div>
      <p
        className="mb-4 font-bold text-[var(--color-text)]"
        style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)' }}
      >
        {capacity}%
      </p>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-subtle)]"
        role="progressbar"
        aria-valuenow={capacity}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} capacity`}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${capacity}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
