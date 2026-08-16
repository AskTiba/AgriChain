import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { RoleSelector } from './role-selector'
import { Wizard } from './wizard'
import { Input } from './ui/input'

interface OnboardingPageProps {
  onSubmit?: (values: { coopName: string; region: string; role: string }) => Promise<void> | void
}

export function OnboardingPage({ onSubmit }: OnboardingPageProps) {
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
      } catch {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Onboarding
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-muted)]">
          Set up your cooperative profile to get started.
        </p>
      </section>

      <div className="mx-auto max-w-2xl">
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
              <h2 className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
                Cooperative Profile
              </h2>

              <form.Field
                name="coopName"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Cooperative name is required' : undefined,
                }}
              >
                {(field) => {
                  const fieldError = field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined
                  const stepError = hasStepError('cooperative name') ? currentErrors.find((e) => e.toLowerCase().includes('cooperative name')) : undefined
                  return (
                    <Input
                      label="Cooperative Name"
                      id="coop-name"
                      type="text"
                      placeholder="e.g. Green Valley Farmers Co-op"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setStepErrors((prev) => ({ ...prev, 0: [] }))
                      }}
                      onBlur={field.handleBlur}
                      error={fieldError || stepError}
                    />
                  )
                }}
              </form.Field>

              <form.Field
                name="region"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Region is required' : undefined,
                }}
              >
                {(field) => {
                  const fieldError = field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined
                  const stepError = hasStepError('region') ? currentErrors.find((e) => e.toLowerCase().includes('region')) : undefined
                  return (
                    <Input
                      label="Region"
                      id="region"
                      type="text"
                      placeholder="e.g. Western Province"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setStepErrors((prev) => ({ ...prev, 0: [] }))
                      }}
                      onBlur={field.handleBlur}
                      error={fieldError || stepError}
                    />
                  )
                }}
              </form.Field>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
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
              <h2 className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
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

          {currentErrors.length > 0 && currentStep === 1 && (
            <div role="alert" className="mt-4 space-y-1">
              {currentErrors.map((err, i) => (
                <p key={i} className="text-sm text-[var(--color-danger)]">{err}</p>
              ))}
            </div>
          )}
        </Wizard>
      </form>
      </div>
    </div>
  )
}
