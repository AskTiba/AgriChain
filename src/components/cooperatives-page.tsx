import { useState } from 'react'
import { useCooperatives, useCreateCooperative, useUsersByCooperative, useAssignUserToCooperative } from '~/app/hooks/use-cooperatives'
import { fetchUnassignedUsers } from '~/app/server/cooperatives'
import { useQuery } from '@tanstack/react-query'

export function CooperativesPage() {
  const { data: cooperatives = [], isFetching } = useCooperatives()
  const createCooperative = useCreateCooperative()
  const assignUser = useAssignUserToCooperative()

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: unassignedUsers = [] } = useQuery({
    queryKey: ['unassignedUsers'],
    queryFn: () => fetchUnassignedUsers(),
    enabled: typeof window !== 'undefined' && showCreate,
  })

  const handleCreate = () => {
    if (!newName.trim() || !newLocation.trim()) return
    createCooperative.mutate(
      { name: newName, location: newLocation },
      {
        onSuccess: () => {
          setNewName('')
          setNewLocation('')
          setShowCreate(false)
        },
      }
    )
  }

  const handleAssign = (userId: string, cooperativeId: string) => {
    assignUser.mutate({ userId, cooperativeId })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-bold text-[var(--color-text)]"
              style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
            >
              Cooperatives
            </h1>
            <p className="mt-2 text-base text-[var(--color-text-muted)]">
              Manage cooperatives and assign members
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
          >
            {showCreate ? 'Cancel' : 'New Cooperative'}
          </button>
        </div>
      </section>

      {showCreate && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">Create Cooperative</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="coop-name" className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]">
                Name
              </label>
              <input
                id="coop-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Green Valley Farmers Co-op"
                className="min-h-[44px] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
              />
            </div>
            <div>
              <label htmlFor="coop-location" className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]">
                Location
              </label>
              <input
                id="coop-location"
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Western Province"
                className="min-h-[44px] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={createCooperative.isPending || !newName.trim() || !newLocation.trim()}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {createCooperative.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {isFetching && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <span className="text-sm text-[var(--color-text-muted)]">Loading...</span>
          </div>
        </div>
      )}

      {cooperatives.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">
            No cooperatives yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cooperatives.map((coop) => (
            <CooperativeCard
              key={coop.id}
              cooperative={coop}
              isExpanded={expandedId === coop.id}
              onToggle={() => setExpandedId(expandedId === coop.id ? null : coop.id)}
              onAssign={handleAssign}
              unassignedUsers={unassignedUsers}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CooperativeCard({
  cooperative,
  isExpanded,
  onToggle,
  onAssign,
  unassignedUsers,
}: {
  cooperative: { id: string; name: string; location: string; createdAt: Date }
  isExpanded: boolean
  onToggle: () => void
  onAssign: (userId: string, cooperativeId: string) => void
  unassignedUsers: { id: string; name: string; email: string; role: string }[]
}) {
  const { data: members = [] } = useUsersByCooperative(cooperative.id)

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
        aria-expanded={isExpanded}
      >
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{cooperative.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{cooperative.location}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--color-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--color-border-subtle)] px-4 pb-4 pt-3">
          {members.length > 0 ? (
            <div className="mb-4 space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{m.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{m.email}</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)] capitalize">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">No members yet.</p>
          )}

          {unassignedUsers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">Assign unassigned users:</p>
              <div className="space-y-1">
                {unassignedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{u.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAssign(u.id, cooperative.id)}
                      className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
