interface HarvestEntry {
  id: string
  cropType: string
  quantity: number
  fieldId: string
}

interface Vehicle {
  id: string
  name: string
  payload: number
  driver: string
  destination: string
}

interface Assignment {
  harvestId: string
  vehicleId: string
}

interface ShipmentAssignmentProps {
  harvests: HarvestEntry[]
  vehicles: Vehicle[]
  assigned: Assignment[]
  onAssign: (harvestId: string, vehicleId: string) => void
}

export function ShipmentAssignment({ harvests, vehicles, assigned, onAssign }: ShipmentAssignmentProps) {
  const assignedHarvestIds = new Set(assigned.map((a) => a.harvestId))
  const unassignedHarvests = harvests.filter((h) => !assignedHarvestIds.has(h.id))

  if (unassignedHarvests.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
        <p className="text-[var(--color-text-muted)]">All harvests assigned to vehicles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Unassigned harvests">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Crop</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Quantity</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Field</th>
              <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Assign to</th>
            </tr>
          </thead>
          <tbody>
            {unassignedHarvests.map((h) => (
              <tr key={h.id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--color-text)]">{h.cropType}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{h.quantity} kg</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{h.fieldId}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onAssign(h.id, v.id)}
                        className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)]"
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}