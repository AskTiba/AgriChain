import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">
          Page Not Found
        </h2>
        <p className="mb-6 text-[var(--color-text-muted)]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] no-underline transition-colors hover:bg-[var(--color-primary-hover)]"
          style={{ minHeight: '44px' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
