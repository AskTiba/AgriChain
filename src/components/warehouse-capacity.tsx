interface Warehouse {
  id: string
  name: string
  used: number
  total: number
}

interface WarehouseCapacityProps {
  warehouses: Warehouse[]
}

function getStatus(percentage: number): 'low' | 'medium' | 'high' {
  if (percentage >= 85) return 'high'
  if (percentage >= 60) return 'medium'
  return 'low'
}

const STATUS_COLORS = {
  low: 'bg-[var(--color-success)]',
  medium: 'bg-[var(--color-warning)]',
  high: 'bg-[var(--color-danger)]',
}

export function WarehouseCapacity({ warehouses }: WarehouseCapacityProps) {
  if (warehouses.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
        <p className="text-[var(--color-text-muted)]">No warehouse data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {warehouses.map((wh) => {
        const percentage = Math.round((wh.used / wh.total) * 100)
        const status = getStatus(percentage)

        return (
          <div
            key={wh.id}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium text-[var(--color-text)]">{wh.name}</h3>
              <span className="text-sm text-[var(--color-text-muted)]">
                {wh.used} / {wh.total} kg
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${wh.name} capacity`}
              className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
            >
              <div
                data-status={status}
                className={`h-full rounded-full transition-all duration-500 ease-out ${STATUS_COLORS[status]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">
              {percentage}%
            </p>
          </div>
        )
      })}
    </div>
  )
}