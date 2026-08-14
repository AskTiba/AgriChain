import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WarehouseCapacity } from '../components/warehouse-capacity'
import { VehicleLedger } from '../components/vehicle-ledger'

export const Route = createFileRoute('/logistics')({
  component: Logistics,
})

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

function Logistics() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)

  const handleAddVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    setVehicles((prev) => [
      ...prev,
      { ...newVehicle, id: crypto.randomUUID() },
    ])
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw + 0.75rem, 3rem)' }}
        >
          Logistics & Transport
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
          Match harvest batches to vehicles, manage driver assignments, and share logistics manifests.
        </p>
      </section>

      <section aria-label="Warehouse capacity" className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
          Warehouse Capacity
        </h2>
        <WarehouseCapacity warehouses={MOCK_WAREHOUSES} />
      </section>

      <section aria-label="Vehicle ledger">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
          Vehicle Ledger
        </h2>
        <VehicleLedger vehicles={vehicles} onAdd={handleAddVehicle} />
      </section>
    </div>
  )
}