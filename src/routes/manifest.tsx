import { createFileRoute } from '@tanstack/react-router'
import { ShareableManifest, decodeManifest } from '../components/shareable-manifest'

export const Route = createFileRoute('/manifest')({
  component: ManifestView,
})

function ManifestView() {
  const search = Route.useSearch()
  const encoded = (search as Record<string, string>).manifest

  if (!encoded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <h1
            className="mb-4 font-bold text-[var(--color-text)]"
            style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)' }}
          >
            No Manifest Data
          </h1>
          <p className="text-[var(--color-text-muted)]">
            This link does not contain a valid manifest. Please ask the sender for a new link.
          </p>
        </div>
      </div>
    )
  }

  const entries = decodeManifest(encoded)

  if (!entries || entries.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <h1
            className="mb-4 font-bold text-[var(--color-text)]"
            style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)' }}
          >
            Invalid Manifest
          </h1>
          <p className="text-[var(--color-text-muted)]">
            The manifest data could not be read. The link may be corrupted or expired.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw + 0.75rem, 3rem)' }}
        >
          Logistics Manifest
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
          Read-only view of the shipment manifest. Shared by your logistics coordinator.
        </p>
      </section>

      <ShareableManifest entries={entries} />
    </div>
  )
}
