import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { HarvestLogList } from '../components/harvest-log-list'
import { Select } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { useHarvests, useAddHarvest } from '../app/hooks/use-harvests'

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

interface HarvestProps {
  onSubmit?: (values: { cropType: string; qualityGrade: string; quantity: number; fieldId: string }) => Promise<void> | void
}

export function Harvest({ onSubmit }: HarvestProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: entries = [], isLoading } = useHarvests()
  const addHarvestMutation = useAddHarvest()

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
        if (onSubmit) {
          await onSubmit(value)
        } else {
          await addHarvestMutation.mutateAsync(value)
        }
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
          {isLoading ? 'Loading harvest data...' : 'Data persisted locally — works offline.'}
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
                <Select
                  label="Crop Type"
                  id="crop-type"
                  placeholder="Select crop type"
                  options={CROP_TYPES}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
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
                <Select
                  label="Quality Grade"
                  id="quality-grade"
                  placeholder="Select quality grade"
                  options={QUALITY_GRADES}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
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
                <Input
                  label="Quantity (kg)"
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 500"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
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
                <Input
                  label="Field ID"
                  id="field-id"
                  type="text"
                  placeholder="e.g. F-001"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
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