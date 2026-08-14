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
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'

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

  const [resolved, setResolved] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    setResolved(resolveTheme(mode))
  }, [mode])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-[var(--color-background)] text-[var(--color-text)] antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="flex min-h-dvh flex-col">
          <header
            className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 backdrop-blur-md"
            role="banner"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <Link to="/" className="flex items-center gap-2 no-underline">
                <span className="text-xl font-bold text-[var(--color-primary)]">
                  Agri-Tech Co-op
                </span>
              </Link>

              <nav aria-label="Primary navigation" className="flex items-center gap-6">
                <Link
                  to="/"
                  className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] [&.active]:text-[var(--color-primary)]"
                  activeOptions={{ exact: true }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/harvest"
                  className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] [&.active]:text-[var(--color-primary)]"
                >
                  Harvest
                </Link>
                <Link
                  to="/logistics"
                  className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] [&.active]:text-[var(--color-primary)]"
                >
                  Logistics
                </Link>
                <Link
                  to="/onboarding"
                  className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] [&.active]:text-[var(--color-primary)]"
                >
                  Onboarding
                </Link>
              </nav>

              <button
                onClick={cycleTheme}
                aria-label={`Theme: ${mode}. Click to cycle.`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {mode === 'system' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                ) : resolved === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </body>
    </html>
  )
}
