import { useState } from 'react'
import { useInvites, useCreateInvite, useDeleteInvite } from '~/app/hooks/use-invites'
import { useCurrentUser } from '~/app/hooks/use-auth'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Co-op Manager',
  driver: 'Driver',
  buyer: 'Buyer',
}

export function InvitesPage() {
  const { data: currentUser } = useCurrentUser()
  const { data: invites = [], isLoading } = useInvites()
  const createInvite = useCreateInvite()
  const deleteInvite = useDeleteInvite()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'driver' | 'buyer'>('buyer')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = currentUser?.role === 'admin'
  const isManager = currentUser?.role === 'manager'

  if (!isAdmin && !isManager) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1
            className="font-bold text-[var(--color-text)]"
            style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
          >
            Access Denied
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Only admins and managers can manage invites.
          </p>
        </section>
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Email is required')
      return
    }

    try {
      await createInvite.mutateAsync({
        email,
        role,
        cooperativeId: currentUser?.cooperativeId,
      })
      setEmail('')
      setRole('buyer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
    }
  }

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke this invite?')) return
    await deleteInvite.mutateAsync(id)
  }

  const isExpired = (expiresAt: Date | string) => new Date() > new Date(expiresAt)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1
          className="font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Manage Invites
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">
          Create invite links for new team members. Invites expire after 7 days.
        </p>
      </section>

      <div className="mx-auto max-w-2xl space-y-8">
        {/* Create Invite Form */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Create Invite
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="invite-email"
                className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Email Address
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="person@example.com"
                required
                className="w-full min-h-[44px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="invite-role"
                className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full min-h-[44px] cursor-pointer rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] transition-colors duration-100 ease-out hover:bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]/20 focus:outline-none"
              >
                <option value="buyer">Buyer</option>
                <option value="driver">Driver</option>
                <option value="manager">Co-op Manager</option>
                {isAdmin && <option value="admin">Admin</option>}
              </select>
            </div>

            <button
              type="submit"
              disabled={createInvite.isPending}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createInvite.isPending ? 'Creating...' : 'Create Invite Link'}
            </button>
          </form>
        </div>

        {/* Invites List */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Pending Invites
          </h2>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Loading...
            </div>
          ) : invites.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No invites yet. Create one above to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => {
                const expired = isExpired(invite.expiresAt)
                const used = !!invite.usedAt
                const inactive = expired || used

                return (
                  <div
                    key={invite.id}
                    className={`flex items-center justify-between rounded-[var(--radius-md)] border p-4 ${
                      inactive
                        ? 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] opacity-60'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {invite.email}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                          {ROLE_LABELS[invite.role] || invite.role}
                        </span>
                        {used && (
                          <span className="inline-flex items-center rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                            Used
                          </span>
                        )}
                        {expired && !used && (
                          <span className="inline-flex items-center rounded-full bg-[var(--color-warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-warning)]">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                        Created by {invite.createdByName || 'Unknown'} ·{' '}
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!inactive && (
                        <button
                          onClick={() => handleCopyLink(invite.token)}
                          className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)]"
                        >
                          {copiedToken === invite.token ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                              </svg>
                              Copy Link
                            </>
                          )}
                        </button>
                      )}
                      {!used && (
                        <button
                          onClick={() => handleDelete(invite.id)}
                          className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
