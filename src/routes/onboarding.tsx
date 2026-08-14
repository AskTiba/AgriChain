import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { RoleSelector } from '../components/role-selector'
import { Wizard } from '../components/wizard'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

interface OnboardingProps {
  onSubmit?: (values: { coopName: string; region: string; role: string }) => Promise<void> | void
}

export function Onboarding({ onSubmit }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({})

  const form = useForm({
    defaultValues: {
      coopName: '',
      region: '',
      role: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      setSubmitted(false)
      try {
        await onSubmit?.(value)
        setSubmitted(true)
        form.reset()
        setCurrentStep(0)
        setStepErrors({})
      } catch (err) {
        setError('Failed to save profile. Please try again.')
      }
    },
  })

  const TOTAL_STEPS = 3

  const validateStep = (step: number): boolean => {
    const errors: string[] = []
    const state = form.state

    if (step === 0) {
      if (!state.values.coopName) errors.push('Cooperative name is required')
      if (!state.values.region) errors.push('Region is required')
    } else if (step === 1) {
      if (!state.values.role) errors.push('Role is required')
    }

    setStepErrors((prev) => ({ ...prev, [step]: errors }))
    return errors.length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await form.handleSubmit()
    }
  }

  const currentErrors = stepErrors[currentStep] || []
  const hasStepError = (fieldName: string): boolean =>
    currentErrors.some((e) =>
      e.toLowerCase().includes(fieldName.toLowerCase())
    )

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

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 p-4 text-[var(--color-success)]"
        >
          Profile saved successfully.
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 p-4 text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}

      <form
        aria-label="Cooperative Profile"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Wizard
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
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
                  <div>
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
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setStepErrors((prev) => ({ ...prev, 0: [] }))
                      }}
                      onBlur={field.handleBlur}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                      placeholder="e.g. Green Valley Farmers Co-op"
                      aria-describedby={field.state.meta.errors.length ? 'coop-name-error' : undefined}
                      aria-invalid={field.state.meta.errors.length > 0 || hasStepError('cooperative name')}
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
                  <div>
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
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setStepErrors((prev) => ({ ...prev, 0: [] }))
                      }}
                      onBlur={field.handleBlur}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                      placeholder="e.g. Western Province"
                      aria-describedby={field.state.meta.errors.length ? 'region-error' : undefined}
                      aria-invalid={field.state.meta.errors.length > 0 || hasStepError('region')}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p id="region-error" role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Select Your Role
              </h2>

              <form.Field
                name="role"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Role is required' : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <RoleSelector
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p id="role-error" role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Review Your Profile
              </h2>

              <form.Subscribe
                selector={(state) => state.values}
              >
                {(values) => (
                  <dl className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <div className="flex justify-between">
                      <dt className="text-sm text-[var(--color-text-muted)]">Cooperative Name</dt>
                      <dd className="text-sm font-medium text-[var(--color-text)]">{values.coopName || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-[var(--color-text-muted)]">Region</dt>
                      <dd className="text-sm font-medium text-[var(--color-text)]">{values.region || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-[var(--color-text-muted)]">Role</dt>
                      <dd className="text-sm font-medium text-[var(--color-text)]">{values.role || '—'}</dd>
                    </div>
                  </dl>
                )}
              </form.Subscribe>
            </div>
          )}

          {currentErrors.length > 0 && (
            <div role="alert" className="mt-4 space-y-1">
              {currentErrors.map((err, i) => (
                <p key={i} className="text-sm text-[var(--color-danger)]">{err}</p>
              ))}
            </div>
          )}
        </Wizard>
      </form>
    </div>
  )
}
