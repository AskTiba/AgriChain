import { useForm } from '@tanstack/react-form'

interface Vehicle {
  id: string
  name: string
  payload: number
  driver: string
  destination: string
}

interface VehicleLedgerProps {
  vehicles: Vehicle[]
  onAdd: (vehicle: Omit<Vehicle, 'id'>) => void
}

export function VehicleLedger({ vehicles, onAdd }: VehicleLedgerProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      payload: 0,
      driver: '',
      destination: '',
    },
    onSubmit: async ({ value }) => {
      onAdd(value)
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
                <div>
                  <label htmlFor="vehicle-name" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Vehicle Name
                  </label>
                  <input
                    id="vehicle-name"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. Truck A"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-xs text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="payload"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value <= 0) return 'Payload must be greater than 0'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="payload" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Payload Capacity (kg)
                  </label>
                  <input
                    id="payload"
                    type="number"
                    min="0"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. 5000"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-xs text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="driver"
              validators={{
                onChange: ({ value }) => (!value ? 'Driver name is required' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="driver" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Driver Name
                  </label>
                  <input
                    id="driver"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. John Doe"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-xs text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="destination"
              validators={{
                onChange: ({ value }) => (!value ? 'Destination is required' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="destination" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Destination
                  </label>
                  <input
                    id="destination"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
                    placeholder="e.g. Market East"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-xs text-[var(--color-danger)]">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => form.handleSubmit()}
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Payload</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Driver</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--color-text)]">Destination</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{v.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{v.payload} kg</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{v.driver}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{v.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}