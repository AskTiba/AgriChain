import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { HarvestLogList } from '../components/harvest-log-list'

export const Route = createFileRoute('/harvest')({
  component: Harvest,
})

const CROP_TYPES = [
  { value: 'maize', label: 'Maize' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'rice', label: 'Rice' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'soybeans', label: 'Soybeans' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
]

const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A — Premium' },
  { value: 'B', label: 'Grade B — Standard' },
  { value: 'C', label: 'Grade C — Economy' },
]

interface HarvestEntry {
  id: string
  cropType: string
  qualityGrade: string
  quantity: number
  fieldId: string
  timestamp: string
}

interface HarvestProps {
  onSubmit?: (values: Omit<HarvestEntry, 'id' | 'timestamp'>) => Promise<void> | void
}

export function Harvest({ onSubmit }: HarvestProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<HarvestEntry[]>([])

  const form = useForm({
    defaultValues: {
      cropType: '',
      qualityGrade: '',
      quantity: 0,
      fieldId: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      setSubmitted(false)
      try {
        await onSubmit?.(value)
        const newEntry: HarvestEntry = {
          ...value,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        }
        setEntries((prev) => [newEntry, ...prev])
        setSubmitted(true)
        form.reset()
      } catch (err) {
        setError('Failed to log harvest. Please try again.')
      }
    },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
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

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 p-4 text-[var(--color-success)]"
        >
          Harvest entry logged successfully.
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

      <section
        aria-label="Log new harvest"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
          New Harvest Entry
        </h2>

        <form
          aria-label="Harvest Log"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="space-y-6">
            <form.Field
              name="cropType"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Crop type is required' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="crop-type"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Crop Type
                  </label>
                  <select
                    id="crop-type"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    aria-invalid={field.state.meta.errors.length > 0}
                  >
                    <option value="">Select crop type</option>
                    {CROP_TYPES.map((crop) => (
                      <option key={crop.value} value={crop.value}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="qualityGrade"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Quality grade is required' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="quality-grade"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Quality Grade
                  </label>
                  <select
                    id="quality-grade"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    aria-invalid={field.state.meta.errors.length > 0}
                  >
                    <option value="">Select quality grade</option>
                    {QUALITY_GRADES.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="quantity"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value <= 0) return 'Quantity must be greater than 0'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Quantity (kg)
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. 500"
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="fieldId"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Field ID is required' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="field-id"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Field ID
                  </label>
                  <input
                    id="field-id"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. F-001"
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Log Harvest
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8" aria-label="Harvest entries">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Recent Entries
        </h2>
        <HarvestLogList entries={entries} />
      </section>
    </div>
  )
}