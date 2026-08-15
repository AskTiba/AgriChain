import { useMemo } from 'react'

interface ManifestEntry {
  vehicleName: string
  driver: string
  destination: string
  cropType: string
  quantity: number
  fieldId: string
}

interface ShareableManifestProps {
  entries: ManifestEntry[]
  onCopy?: (url: string) => void
}

export function encodeManifest(entries: ManifestEntry[]): string {
  const json = JSON.stringify(entries)
  return btoa(encodeURIComponent(json))
}

export function decodeManifest(encoded: string): ManifestEntry[] | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

export function ShareableManifest({ entries, onCopy }: ShareableManifestProps) {
  const url = useMemo(() => {
    if (entries.length > 0 && typeof window !== 'undefined') {
      const encoded = encodeManifest(entries)
      return `${window.location.origin}/manifest?manifest=${encoded}`
    }
    return ''
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
        <p className="text-[var(--color-text-muted)]">No shipments to share.</p>
      </div>
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    onCopy?.(url)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Transport manifest">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Vehicle</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Driver</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Destination</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Crop</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Quantity</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Field</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--color-text)]">{entry.vehicleName}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{entry.driver}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{entry.destination}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{entry.cropType}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{entry.quantity} kg</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{entry.fieldId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        <CopyIcon />
        Copy Manifest Link
      </button>
    </div>
  )
}

export type { ManifestEntry, ShareableManifestProps }
