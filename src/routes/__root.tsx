/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { localStoragePersister } from '~/router'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seedData, seedDataScript } from '~/app/lib/seed-data'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#1E5E3A' },
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
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
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

function RootDocument({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>('system')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    seedData()
  }, [])

  React.useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeMode | null
    setMode(stored || 'system')
  }, [])

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
    { to: '/onboarding', label: 'Onboarding' },
  ]

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: seedDataScript }} />
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
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
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

                    {/* Mobile menu button */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                      aria-expanded={mobileMenuOpen}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] md:hidden"
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

          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <Scripts />
        </PersistQueryClientProvider>
      </body>
    </html>
  )
}
