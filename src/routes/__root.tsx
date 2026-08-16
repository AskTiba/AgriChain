/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { localStoragePersister } from '~/router'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { getCurrentUser } from '~/app/server/auth'
import { useLogout } from '~/app/hooks/use-auth'
import { useUnreadCount } from '~/app/hooks/use-notifications'
import type { SafeUser } from '~/app/db/schema'
import appCss from '~/styles/app.css?url'

const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  return await getCurrentUser()
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  user: SafeUser | null
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#1E5E3A', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#141E15', media: '(prefers-color-scheme: dark)' },
      { title: 'Agri-Tech Co-op' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  beforeLoad: async () => {
    let user: SafeUser | null = null
    try {
      user = await fetchUser()
    } catch {
      // Not authenticated — that's fine
    }
    return { user }
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <Link
      to="/notifications"
      className="relative inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

function AuthButtons({ user }: { user: { name: string } }) {
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    window.location.href = '/login'
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <NotificationBell />
      <span className="text-sm text-[var(--color-text-muted)]">{user.name}</span>
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] disabled:opacity-50"
      >
        {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}

function MobileLogoutButton() {
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="block w-full cursor-pointer px-3 py-2.5 text-left text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-surface)] disabled:opacity-50"
    >
      {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}

type ThemeMode = 'light' | 'dark' | 'system'

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

const themeScript = `
  (function() {
    var stored = localStorage.getItem('theme');
    var mode = stored || 'system';
    var resolved = mode;
    if (mode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(resolved);
  })();
`

const DevTools = import.meta.env.DEV
  ? React.lazy(() =>
      Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ]).then(([router, query]) => ({
        default: () => (
          <>
            <router.TanStackRouterDevtools position="bottom-right" />
            <query.ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ),
      })),
    )
  : null

function RootDocument({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as ThemeMode) || 'system'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const routeContext = Route.useRouteContext()
  const user = routeContext.user

  React.useEffect(() => {
    const resolved = resolveTheme(mode)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)
    localStorage.setItem('theme', mode)
  }, [mode])

  React.useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  function cycleTheme() {
    setMode((prev) => {
      const order: ThemeMode[] = ['light', 'dark', 'system']
      return order[(order.indexOf(prev) + 1) % order.length]
    })
  }

  const navLinks = [
    { to: '/', label: 'Dashboard', exact: true },
    { to: '/harvest', label: 'Harvest' },
    { to: '/logistics', label: 'Logistics' },
    { to: '/buyer', label: 'Buyer' },
    { to: '/orders', label: 'Orders' },
    { to: '/cooperatives', label: 'Cooperatives' },
    { to: '/onboarding', label: 'Onboarding' },
  ]

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-[var(--color-background)] text-[var(--color-text)] antialiased">
        <PersistQueryClientProvider
          client={Route.useRouteContext().queryClient}
          persistOptions={{ persister: localStoragePersister }}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="flex min-h-dvh flex-col">
            <header
              className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 backdrop-blur-md"
              role="banner"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                  <Link to="/" className="flex cursor-pointer items-center gap-2 no-underline">
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                      Agri-Tech Co-op
                    </span>
                  </Link>

                  {/* Desktop nav */}
                  <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] [&.active]:bg-[var(--color-primary)]/10 [&.active]:text-[var(--color-primary)]"
                        activeOptions={link.exact ? { exact: true } : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <button
                      onClick={cycleTheme}
                      aria-label={`Theme: ${mode}. Click to cycle.`}
                      type="button"
                      className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                    >
                      {mode === 'system' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                      ) : mode === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2" />
                          <path d="M12 20v2" />
                          <path d="m4.93 4.93 1.41 1.41" />
                          <path d="m17.66 17.66 1.41 1.41" />
                          <path d="M2 12h2" />
                          <path d="M20 12h2" />
                          <path d="m6.34 17.66-1.41 1.41" />
                          <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                      )}
                    </button>

                    {/* Auth buttons - desktop */}
                    {user ? (
                      <AuthButtons user={user} />
                    ) : (
                      <div className="hidden items-center gap-2 md:flex">
                        <Link
                          to="/login"
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-hover)]"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}

                    {/* Mobile menu button */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                      aria-expanded={mobileMenuOpen}
                      type="button"
                      className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] md:hidden"
                    >
                      {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" x2="20" y1="12" y2="12" />
                          <line x1="4" x2="20" y1="6" y2="6" />
                          <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile nav */}
                {mobileMenuOpen && (
                  <nav aria-label="Primary navigation" className="border-t border-[var(--color-border-subtle)] py-2 md:hidden">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block cursor-pointer px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] [&.active]:bg-[var(--color-primary)]/10 [&.active]:text-[var(--color-primary)]"
                        activeOptions={link.exact ? { exact: true } : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {user && (
                      <Link
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block cursor-pointer px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] [&.active]:bg-[var(--color-primary)]/10 [&.active]:text-[var(--color-primary)]"
                      >
                        Notifications
                      </Link>
                    )}
                      <div className="border-t border-[var(--color-border-subtle)] mt-2 pt-2">
                      {user ? (
                        <>
                          <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">
                            Signed in as <span className="font-medium text-[var(--color-text)]">{user.name}</span>
                          </div>
                          <MobileLogoutButton />
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block cursor-pointer px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block cursor-pointer px-3 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface)]"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                )}
              </div>
            </header>

            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>

            <footer
              className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
              role="contentinfo"
            >
              <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-[var(--color-text-subtle)] sm:px-6 lg:px-8">
                Agri-Tech Cooperative & Supply Chain Tracker
              </div>
            </footer>
          </div>

          {DevTools && (
            <React.Suspense fallback={null}>
              <DevTools />
            </React.Suspense>
          )}
          <Scripts />
        </PersistQueryClientProvider>
      </body>
    </html>
  )
}
