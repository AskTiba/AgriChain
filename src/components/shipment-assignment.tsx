import { useState } from 'react'
import { Input } from './ui/input'

interface HarvestEntry {
  id: string
  cropType: string
  quantity: number
  fieldId: string
}

interface Vehicle {
  id: string
  name: string
}

interface Assignment {
  harvestId: string
  vehicleId: string
}

interface ShipmentAssignmentProps {
  harvests: HarvestEntry[]
  vehicles: Vehicle[]
  assigned: Assignment[]
  onAssign: (harvestId: string, vehicleId: string, driverName: string, destination: string) => void
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

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
        <p className="text-[var(--color-text-muted)]">Add a vehicle first to start assigning harvests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {unassignedHarvests.map((h) => (
        <AssignmentRow
          key={h.id}
          harvest={h}
          vehicles={vehicles}
          onAssign={onAssign}
        />
      ))}
    </div>
  )
}

function AssignmentRow({
  harvest,
  vehicles,
  onAssign,
}: {
  harvest: HarvestEntry
  vehicles: Vehicle[]
  onAssign: (harvestId: string, vehicleId: string, driverName: string, destination: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '')
  const [driverName, setDriverName] = useState('')
  const [destination, setDestination] = useState('')

  const handleSubmit = () => {
    if (!selectedVehicle || !driverName || !destination) return
    onAssign(harvest.id, selectedVehicle, driverName, destination)
    setExpanded(false)
    setDriverName('')
    setDestination('')
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div>
          <span className="font-medium text-[var(--color-text)]">{harvest.cropType}</span>
          <span className="ml-2 text-sm text-[var(--color-text-muted)]">
            {harvest.quantity} kg · {harvest.fieldId}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/5 px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
        >
          {expanded ? 'Cancel' : 'Assign'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border-subtle)] p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor={`vehicle-${harvest.id}`} className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]">
                Vehicle
              </label>
              <select
                id={`vehicle-${harvest.id}`}
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full min-h-[44px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Driver Name"
              id={`driver-${harvest.id}`}
              type="text"
              placeholder="e.g. John Doe"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
            <Input
              label="Destination"
              id={`dest-${harvest.id}`}
              type="text"
              placeholder="e.g. Market East"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedVehicle || !driverName || !destination}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
