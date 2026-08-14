interface RoleSelectorProps {
  value: string
  onChange: (role: string) => void
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'co-op-manager', label: 'Co-op Manager', description: 'Manage cooperative operations' },
  { value: 'driver', label: 'Driver', description: 'Transport and delivery' },
  { value: 'buyer', label: 'Buyer', description: 'Purchase and procurement' },
] as const

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 block text-sm font-medium text-[var(--color-text)]">
        Select Your Role
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <label
            key={role.value}
            className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-4 transition-colors ${
              value === role.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50'
            }`}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={value === role.value}
              onChange={() => onChange(role.value)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {role.label}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {role.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
