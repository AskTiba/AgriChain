import { ReactNode } from 'react'

interface WizardProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSubmit?: () => void
  children: ReactNode
}

export function Wizard({ currentStep, totalSteps, onNext, onBack, onSubmit, children }: WizardProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          Step {currentStep + 1} of {totalSteps}
        </p>
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i <= currentStep
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">{children}</div>

      <div className="flex justify-between">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)]"
          >
            Back
          </button>
        )}
        <div className="ml-auto">
          {isLastStep ? (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
