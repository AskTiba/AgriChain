import { useState } from 'react'
import { WarehouseCapacity } from './warehouse-capacity'
import { VehicleLedger } from './vehicle-ledger'
import { ShipmentAssignment } from './shipment-assignment'
import { ShareableManifest, type ManifestEntry } from './shareable-manifest'
import { useHarvests } from '~/app/hooks/use-harvests'
import { useVehicles, useAddVehicle } from '~/app/hooks/use-vehicles'
import { useAssignments, useAddAssignment } from '~/app/hooks/use-assignments'

export function LogisticsPage() {
  const { data: dbHarvests = [] } = useHarvests()
  const { data: dbVehicles = [] } = useVehicles()
  const { data: dbAssignments = [] } = useAssignments()
  const addVehicle = useAddVehicle()
  const addAssignment = useAddAssignment()
  const [copied, setCopied] = useState(false)

  const harvests = dbHarvests.map((h) => ({
    id: h.id,
    cropType: h.cropType,
    quantity: h.quantity,
    fieldId: h.fieldId,
  }))

  const vehicles = dbVehicles.map((v) => ({
    id: v.id,
    name: v.name,
    type: v.type,
    plateNumber: v.plateNumber,
    payloadCapacity: v.payloadCapacity,
    status: v.status,
  }))

  const assignments = dbAssignments.map((a) => ({
    harvestId: a.harvestId ?? '',
    vehicleId: a.vehicleId ?? '',
    driverName: a.driverName,
    destination: a.destination,
  }))

  const handleAddVehicle = (newVehicle: {
    name: string
    type: 'truck' | 'pickup' | 'motorcycle' | 'other'
    plateNumber?: string | null
    payloadCapacity: number
  }) => {
    addVehicle.mutate(newVehicle)
  }

  const handleAssign = (harvestId: string, vehicleId: string, driverName: string, destination: string) => {
    addAssignment.mutate({ harvestId, vehicleId, driverName, destination })
  }

  const manifestEntries: ManifestEntry[] = assignments.map((a) => {
    const harvest = harvests.find((h) => h.id === a.harvestId)
    const vehicle = vehicles.find((v) => v.id === a.vehicleId)
    if (!harvest || !vehicle) return null
    return {
      vehicleName: vehicle.name,
      driver: a.driverName,
      destination: a.destination,
      cropType: harvest.cropType,
      quantity: harvest.quantity,
      fieldId: harvest.fieldId,
    }
  }).filter(Boolean) as ManifestEntry[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Logistics & Transport
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-muted)]">
          Match harvest batches to vehicles, manage driver assignments, and share logistics manifests.
        </p>
      </section>

      <section aria-label="Warehouse capacity" className="mb-12">
        <h2 className="mb-6 font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
          Warehouse Capacity
        </h2>
        <WarehouseCapacity warehouses={[]} />
      </section>

      <section aria-label="Vehicle ledger" className="mb-12">
        <h2 className="mb-6 font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
          Vehicle Ledger
        </h2>
        <VehicleLedger vehicles={vehicles} onAdd={handleAddVehicle} />
      </section>

      <section aria-label="Shipment assignment" className="mb-12">
        <h2 className="mb-6 font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
          Assign Shipments
        </h2>
        <ShipmentAssignment
          harvests={harvests}
          vehicles={vehicles}
          assigned={assignments}
          onAssign={handleAssign}
        />
      </section>

      {manifestEntries.length > 0 && (
        <section aria-label="Share manifest" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
              Share Manifest
            </h2>
            {copied && (
              <span className="text-sm text-[var(--color-success)]">Link copied!</span>
            )}
          </div>
          <ShareableManifest
            entries={manifestEntries}
            onCopy={() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          />
        </section>
      )}
    </div>
  )
}
