import { useRouter } from '@tanstack/react-router'

export function DefaultCatchBoundary({
  error,
}: {
  error: Error
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">
          Something went wrong
        </h2>
        <p className="mb-6 text-[var(--color-text-muted)]">{error.message}</p>
        <button
          onClick={() => router.invalidate()}
          className="cursor-pointer rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
          style={{ minHeight: '44px' }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
