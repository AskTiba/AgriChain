import { forwardRef } from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`
    const hasError = error !== undefined && error !== ''

    return (
      <div className="group">
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className={[
            'w-full rounded-[var(--radius-md)] border bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] transition-all duration-200',
            'placeholder:text-[var(--color-text-subtle)]',
            'hover:border-[var(--color-primary)]/40 hover:shadow-[0_0_0_1px_var(--color-primary)]/10',
            'focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]/10 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--color-border)] disabled:hover:shadow-none',
            hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_var(--color-danger)]/10'
              : 'border-[var(--color-border)]',
            className,
          ].join(' ')}
          {...props}
        />

        {hasError && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={hintId} className="mt-1.5 text-sm text-[var(--color-text-subtle)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export type { InputProps }
