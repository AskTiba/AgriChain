import { useState, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Input } from '~/components/ui/input'
import { useValidateInvite, useConsumeInvite } from '~/app/hooks/use-invites'
import { useInviteRegister } from '~/app/hooks/use-auth'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Co-op Manager',
  driver: 'Driver',
  buyer: 'Buyer',
}

export function InviteRegisterPage() {
  const { token } = useParams({ from: '/invite/$token' })
  const validateInvite = useValidateInvite()
  const inviteRegister = useInviteRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<{
    email: string
    role: string
    cooperativeId: string | null
  } | null>(null)

  useEffect(() => {
    if (token) {
      validateInvite.mutate(token, {
        onSuccess: (result) => {
          if (result.valid && result.invite) {
            setInviteData(result.invite)
            setEmail(result.invite.email)
          }
        },
      })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      await inviteRegister.mutateAsync({
        name,
        email,
        password,
        inviteToken: token,
      })
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  if (validateInvite.isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1
            className="font-bold text-[var(--color-text)]"
            style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
          >
            Validating Invite...
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Please wait while we check your invitation.
          </p>
        </section>
      </div>
    )
  }

  if (validateInvite.isError || !inviteData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1
            className="font-bold text-[var(--color-text)]"
            style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
          >
            Invalid Invite
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            {validateInvite.error?.message || 'This invite link is invalid or has expired.'}
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Go to Sign In
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Join via Invitation
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-muted)]">
          You've been invited to join as{' '}
          <span className="font-medium text-[var(--color-primary)]">
            {ROLE_LABELS[inviteData.role] || inviteData.role}
          </span>.
          Complete your registration below.
        </p>
      </section>

      <div className="mx-auto max-w-md">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]"
              >
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              className="opacity-70"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={inviteRegister.isPending}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviteRegister.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
