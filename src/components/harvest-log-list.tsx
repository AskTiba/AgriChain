interface HarvestEntry {
  id: string
  cropType: string
  qualityGrade: string
  quantity: number
  fieldId: string
  timestamp: string
}

interface HarvestLogListProps {
  entries: HarvestEntry[]
}

const QUALITY_LABELS: Record<string, string> = {
  A: 'Grade A',
  B: 'Grade B',
  C: 'Grade C',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HarvestLogList({ entries }: HarvestLogListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
        <p className="text-[var(--color-text-muted)]">No harvest entries yet. Log your first harvest above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
            <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Crop Type</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Quality</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Quantity</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Field ID</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Logged</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
              <td className="px-4 py-3 text-[var(--color-text)]">{entry.cropType}</td>
              <td className="px-4 py-3 text-[var(--color-text)]">{QUALITY_LABELS[entry.qualityGrade] || entry.qualityGrade}</td>
              <td className="px-4 py-3 text-[var(--color-text)]">{entry.quantity} kg</td>
              <td className="px-4 py-3 text-[var(--color-text-muted)]">{entry.fieldId}</td>
              <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(entry.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}