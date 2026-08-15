import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 animate-fade-in-up">
        <h1
          className="mb-4 font-bold text-[var(--color-text)]"
          style={{ fontSize: 'clamp(1.25rem, 2vw + 0.75rem, 1.75rem)' }}
        >
          Agri-Tech Cooperative
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-muted)]">
          Streamlining harvest logistics, transport coordination, and warehouse allocation for regional smallholder cooperatives.
        </p>
      </section>

      <section aria-label="Cooperative overview stats" className="mb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard label="Active Harvests" value="127" />
          <StatCard label="Warehouses" value="4" />
          <StatCard label="Vehicles" value="18" />
          <StatCard label="Pending Shipments" value="34" />
        </div>
      </section>

      <section aria-label="Quick actions" className="mb-12">
        <h2 className="mb-6 font-semibold text-[var(--color-text)]" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          <ActionCard
            title="Log Harvest"
            description="Record a new yield entry from the field."
            href="/harvest"
            accentColor="var(--color-primary)"
          />
          <ActionCard
            title="Assign Driver"
            description="Match a harvest batch to available transport."
            href="/logistics"
            accentColor="var(--color-secondary)"
          />
          <ActionCard
            title="View Capacity"
            description="Check warehouse storage levels in real time."
            href="/logistics"
            accentColor="var(--color-accent)"
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="animate-fade-in-up rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm transition-shadow hover:shadow-md"
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
        </span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22 16 8" />
            <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
          </svg>
        </span>
      </div>
      <p
        className="font-bold text-[var(--color-text)]"
        style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)' }}
      >
        {value}
      </p>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  accentColor,
}: {
  title: string
  description: string
  href: string
  accentColor: string
}) {
  return (
    <Link
      to={href}
      className="group block animate-fade-in-up rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm no-underline transition-all hover:border-[var(--color-primary)] hover:shadow-md"
      style={{ borderLeftColor: accentColor, borderLeftWidth: '4px' }}
    >
      <h3 className="mb-2 text-base font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
    </Link>
  )
}
