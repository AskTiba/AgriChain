import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '~/app/hooks/use-notifications'
import { Link } from '@tanstack/react-router'

export function NotificationsPage() {
  const { data: notifications = [], isFetching } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = notifications.filter((n) => !n.read).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" x2="21" y1="6" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )
      case 'order_confirmed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )
      case 'driver_assigned':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.2 1 13v3c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        )
      case 'status_changed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )
      default:
        return null
    }
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
              Notifications
            </h1>
            <p className="mt-2 text-base text-[var(--color-text-muted)]">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>
      </section>

      {isFetching && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <span className="text-sm text-[var(--color-text-muted)]">Loading...</span>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-12 text-center shadow-sm">
          <p className="text-[var(--color-text-muted)]">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors ${
                notification.read
                  ? 'border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]'
                  : 'border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${notification.read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-primary)]'}`}>
                {getTypeIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${notification.read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {notification.orderId && (
                  <Link
                    to="/orders/$orderNumber"
                    params={{ orderNumber: notification.message.match(/ORD-\d+/)?.[0] || '' }}
                    className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  >
                    View
                  </Link>
                )}
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="inline-flex min-h-[36px] cursor-pointer items-center rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
