import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

export function Onboarding() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw + 0.75rem, 3rem)' }}
        >
          Onboarding
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
          Set up your cooperative profile to get started.
        </p>
      </section>

      <form
        aria-label="Cooperative Profile"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          Cooperative Profile
        </h2>

        <div className="mb-6">
          <label
            htmlFor="coop-name"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Cooperative Name
          </label>
          <input
            id="coop-name"
            type="text"
            required
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
            placeholder="e.g. Green Valley Farmers Co-op"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="region"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Region
          </label>
          <input
            id="region"
            type="text"
            required
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
            placeholder="e.g. Western Province"
          />
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Save Profile
        </button>
      </form>
    </div>
  )
}
