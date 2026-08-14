import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/harvest')({
  component: Harvest,
})

function Harvest() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw + 0.75rem, 3rem)' }}
        >
          Harvest Logging
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
          Record yield entries, track quality grades, and manage harvest inventory from the field.
        </p>
      </section>

      <div
        className="mb-8 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4"
        role="status"
        aria-live="polite"
      >
        <span className="h-3 w-3 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
        <span className="text-sm text-[var(--color-text-muted)]">
          Connected — all changes sync in real time.
        </span>
      </div>

      <section
        aria-label="Log new harvest"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          New Harvest Entry
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Form will be built using TanStack Form with field-level subscription rendering.
        </p>
      </section>
    </div>
  )
}
