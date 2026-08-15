import { forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors duration-100 ease-out group-focus-within:text-[var(--color-primary)]"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, hint, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${selectId}-error`
    const hintId = `${selectId}-hint`
    const hasError = error !== undefined && error !== ''

    return (
      <div className="group">
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]"
        >
          {label}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={[
              'w-full cursor-pointer appearance-none rounded-lg border bg-[var(--color-surface-elevated)] px-3 py-2 pr-8 text-[14px] text-[var(--color-text)] transition-colors duration-100 ease-out',
              'hover:bg-[var(--color-surface)]',
              'focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]/20 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-40',
              hasError
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_var(--color-danger)]/20'
                : 'border-[var(--color-border)]',
              className,
            ].join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronIcon />
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="mt-1 text-[12px] text-[var(--color-danger)]">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={hintId} className="mt-1 text-[12px] text-[var(--color-text-subtle)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export type { SelectOption, SelectProps }
