import { useForm } from '@tanstack/react-form'
import { Input } from './ui/input'
import { Select } from './ui/select'

interface Vehicle {
  id: string
  name: string
  type: string
  plateNumber: string | null
  payloadCapacity: number
  status: string
}

interface VehicleLedgerProps {
  vehicles: Vehicle[]
  onAdd: (vehicle: {
    name: string
    type: 'truck' | 'pickup' | 'motorcycle' | 'other'
    plateNumber?: string | null
    payloadCapacity: number
  }) => void
}

const VEHICLE_TYPES = [
  { value: 'truck', label: 'Truck' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'other', label: 'Other' },
]

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  'in-use': 'In Use',
  maintenance: 'Maintenance',
}

export function VehicleLedger({ vehicles, onAdd }: VehicleLedgerProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      type: 'truck' as 'truck' | 'pickup' | 'motorcycle' | 'other',
      plateNumber: '',
      payloadCapacity: 0,
    },
    onSubmit: async ({ value }) => {
      onAdd({
        name: value.name,
        type: value.type,
        plateNumber: value.plateNumber || null,
        payloadCapacity: value.payloadCapacity,
      })
      form.reset()
    },
  })

  return (
    <div className="space-y-8">
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Add New Vehicle
        </h3>
        <form
          aria-label="Add vehicle"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value ? 'Name is required' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Vehicle Name"
                  id="vehicle-name"
                  type="text"
                  placeholder="e.g. Blue Pickup, Main Truck"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>

            <form.Field
              name="type"
            >
              {(field) => (
                <Select
                  label="Vehicle Type"
                  id="vehicle-type"
                  placeholder="Select type"
                  options={VEHICLE_TYPES}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'truck' | 'pickup' | 'motorcycle' | 'other')}
                  onBlur={field.handleBlur}
                />
              )}
            </form.Field>

            <form.Field
              name="plateNumber"
            >
              {(field) => (
                <Input
                  label="Plate Number (optional)"
                  id="plate-number"
                  type="text"
                  placeholder="e.g. KCA 123B"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </form.Field>

            <form.Field
              name="payloadCapacity"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value <= 0) return 'Capacity must be greater than 0'
                  return undefined
                },
              }}
            >
              {(field) => (
                <Input
                  label="Payload Capacity (kg)"
                  id="payload-capacity"
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">No vehicles registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-sm">
          <table className="w-full text-left text-sm" aria-label="Vehicles">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Type</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Plate</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Capacity</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{v.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] capitalize">{v.type}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs">{v.plateNumber || '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{v.payloadCapacity} kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      v.status === 'available'
                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        : v.status === 'in-use'
                          ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                          : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                    }`}>
                      {STATUS_LABELS[v.status] || v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
