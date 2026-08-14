import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

interface OnboardingProps {
  onSubmit?: (values: { coopName: string; region: string }) => void
}

export function Onboarding({ onSubmit }: OnboardingProps) {
  const form = useForm({
    defaultValues: {
      coopName: '',
      region: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit?.(value)
    },
  })

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
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          Cooperative Profile
        </h2>

        <form.Field
          name="coopName"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Cooperative name is required' : undefined,
          }}
        >
          {(field) => (
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
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                placeholder="e.g. Green Valley Farmers Co-op"
                aria-describedby={field.state.meta.errors.length ? 'coop-name-error' : undefined}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.length > 0 && (
                <p id="coop-name-error" role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="region"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Region is required' : undefined,
          }}
        >
          {(field) => (
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
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                placeholder="e.g. Western Province"
                aria-describedby={field.state.meta.errors.length ? 'region-error' : undefined}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.length > 0 && (
                <p id="region-error" role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

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
