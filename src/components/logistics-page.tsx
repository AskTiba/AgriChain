import { useState } from 'react'
import { WarehouseCapacity } from './warehouse-capacity'
import { VehicleLedger } from './vehicle-ledger'
import { ShipmentAssignment } from './shipment-assignment'
import { ShareableManifest, type ManifestEntry } from './shareable-manifest'
import { useHarvests } from '~/app/hooks/use-harvests'

const MOCK_WAREHOUSES = [
  { id: 'W1', name: 'Warehouse A', used: 780, total: 1000 },
  { id: 'W2', name: 'Warehouse B', used: 450, total: 1000 },
  { id: 'W3', name: 'Warehouse C', used: 920, total: 1000 },
  { id: 'W4', name: 'Warehouse D', used: 310, total: 1000 },
]

interface Vehicle {
  id: string
  name: string
  payload: number
  driver: string
  destination: string
}

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'V1', name: 'Truck A', payload: 5000, driver: 'John Doe', destination: 'Market East' },
  { id: 'V2', name: 'Truck B', payload: 3000, driver: 'Jane Smith', destination: 'Warehouse North' },
]

interface Assignment {
  harvestId: string
  vehicleId: string
}

export function LogisticsPage() {
  const { data: dbHarvests = [] } = useHarvests()
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [copied, setCopied] = useState(false)

  const harvests = dbHarvests.length > 0
    ? dbHarvests.map((h) => ({ id: h.id, cropType: h.cropType, quantity: h.quantity, fieldId: h.fieldId }))
    : MOCK_WAREHOUSES.length > 0 ? [
        { id: 'H1', cropType: 'Tomatoes', quantity: 450, fieldId: 'Field A' },
        { id: 'H2', cropType: 'Maize', quantity: 1200, fieldId: 'Field B' },
        { id: 'H3', cropType: 'Beans', quantity: 300, fieldId: 'Field A' },
        { id: 'H4', cropType: 'Cabbage', quantity: 600, fieldId: 'Field C' },
      ] : []

  const handleAddVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    setVehicles((prev) => [
      ...prev,
      { ...newVehicle, id: crypto.randomUUID() },
    ])
  }

  const handleAssign = (harvestId: string, vehicleId: string) => {
    setAssignments((prev) => [...prev, { harvestId, vehicleId }])
  }

  const manifestEntries: ManifestEntry[] = assignments.map((a) => {
    const harvest = harvests.find((h) => h.id === a.harvestId)!
    const vehicle = vehicles.find((v) => v.id === a.vehicleId)!
    return {
      vehicleName: vehicle.name,
      driver: vehicle.driver,
      destination: vehicle.destination,
      cropType: harvest.cropType,
      quantity: harvest.quantity,
      fieldId: harvest.fieldId,
    }
  })

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
        <WarehouseCapacity warehouses={MOCK_WAREHOUSES} />
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
