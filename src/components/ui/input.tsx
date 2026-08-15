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
          className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className={[
            'w-full cursor-text rounded-lg border bg-[var(--color-surface-elevated)] px-3 py-2 text-[14px] text-[var(--color-text)] transition-colors duration-100 ease-out',
            'placeholder:text-[var(--color-text-subtle)]',
            'hover:bg-[var(--color-surface)]',
            'focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
            hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_var(--color-danger)]/20'
              : 'border-[var(--color-border)]',
            className,
          ].join(' ')}
          {...props}
        />

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

Input.displayName = 'Input'

export type { InputProps }
