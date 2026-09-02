import { Link } from '@tanstack/react-router'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import * as React from 'react'

/* ──────────────────────────────────────────────
   ANIMATION HELPERS
   ────────────────────────────────────────────── */

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!startOnView || !isInView || prefersReducedMotion) {
      if (prefersReducedMotion) setValue(end)
      return
    }
    let startTime: number | null = null
    let raf: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isInView, end, duration, startOnView])

  return { ref, value }
}

function FadeIn({
  children,
  delay = 0,
  className = '',
  y = 40,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ScaleIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────
   SECTION 1: HERO
   ────────────────────────────────────────────── */

function HeroSection() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], [0, 200])
  const textY = useTransform(scrollY, [0, 600], [0, -80])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  return (
    <section className="relative min-h-dvh overflow-hidden" aria-label="Hero">
      {/* Parallax background layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20 -bottom-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[#1a4f30] to-[#0d3318]" />
        {/* Decorative grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Radial glow */}
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary-hover)]/20 blur-[120px]" />
      </motion.div>

      {/* Floating decorative shapes */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[15%] top-[20%] h-32 w-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm lg:h-48 lg:w-48"
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute left-[10%] top-[35%] h-24 w-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm lg:h-36 lg:w-36"
          />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[25%] right-[25%] h-16 w-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm lg:h-24 lg:w-24"
          />
        </>
      )}

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex min-h-dvh items-center"
      >
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                Modern Agricultural Supply Chain
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1
                className="mb-6 font-bold leading-[1.08] tracking-tight text-white"
                style={{ fontSize: 'clamp(2.5rem, 5vw + 1rem, 4.5rem)' }}
              >
                From Farm to
                <span className="block bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] bg-clip-text text-transparent">
                  Market, Transparently.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p
                className="mb-10 max-w-xl leading-relaxed text-white/70"
                style={{ fontSize: 'clamp(1.05rem, 1.5vw + 0.5rem, 1.3rem)' }}
              >
                Empowering cooperatives with real-time harvest tracking, logistics
                management, and direct farmer-to-buyer connections. Built for the
                people who feed the world.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex min-h-[52px] items-center rounded-xl bg-white px-8 text-base font-semibold text-[var(--color-primary)] shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30"
                >
                  Get Started Free
                  <svg
                    className="ml-2 inline-block h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-[52px] items-center rounded-xl border border-white/25 px-8 text-base font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </FadeIn>

            {/* Trust badges */}
            <FadeIn delay={0.65}>
              <div className="mt-14 flex flex-wrap items-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free for cooperatives
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Launch in minutes
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        {!prefersReducedMotion && (
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs font-medium tracking-widest text-white/40 uppercase">Scroll</span>
            <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 2: STATS (Count-up)
   ────────────────────────────────────────────── */

function StatItem({ label, value, suffix = '', prefix = '' }: { label: string; value: number; suffix?: string; prefix?: string }) {
  const { ref, value: count } = useCountUp(value, 2200)

  return (
    <div ref={ref} className="text-center">
      <div className="mb-2 font-bold tracking-tight text-[var(--color-text)]" style={{ fontSize: 'clamp(2rem, 3vw + 0.5rem, 3.25rem)' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-medium text-[var(--color-text-muted)]">{label}</div>
    </div>
  )
}

function StatsSection() {
  return (
    <section className="relative z-10 -mt-16" aria-label="Platform statistics">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScaleIn>
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-8 shadow-xl shadow-black/5 sm:p-10 lg:grid-cols-4">
            <StatItem label="Active Cooperatives" value={240} suffix="+" />
            <StatItem label="Harvests Tracked" value={12400} suffix="+" />
            <StatItem label="Orders Processed" value={8700} suffix="+" />
            <StatItem label="Drivers Onboarded" value={580} suffix="+" />
          </div>
        </ScaleIn>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 3: FEATURES
   ────────────────────────────────────────────── */

const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: 'Harvest Tracking',
    description: 'Log harvests in real-time from the field. Track crop type, quantity, quality grade, and GPS location — all synced instantly across your cooperative.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Logistics & Transport',
    description: 'Assign drivers, match harvest batches to vehicles, and share logistics manifests. Track shipments from farm gate to warehouse in real-time.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    title: 'Warehouse Management',
    description: 'Monitor warehouse capacity, track stored harvests, and manage inventory across your storage network. Never lose track of what is stored where.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'Direct Buyer Orders',
    description: 'Connect farmers directly with buyers. Negotiate prices, confirm orders, and manage the entire purchase lifecycle — eliminating middlemen.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Cooperative Management',
    description: 'Organize members by role — admin, manager, driver, buyer. Invite new members, assign roles, and manage your cooperative from one dashboard.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'Live Dashboard & Reports',
    description: 'Real-time analytics on harvests, orders, and logistics. Visualize your supply chain performance with charts, filters, and exportable reports.',
  },
]

function FeaturesSection() {
  return (
    <section className="relative py-28 sm:py-36" aria-label="Features">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-background)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1 text-sm font-semibold text-[var(--color-primary)]">
              Platform Features
            </span>
            <h2
              className="mb-4 font-bold tracking-tight text-[var(--color-text)]"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)' }}
            >
              Everything Your Cooperative Needs
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              A complete supply chain platform — from field to fork. Track, manage, and grow your agricultural operations with confidence.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-8 transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/5">
                {/* Icon */}
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">{feature.title}</h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 4: HOW IT WORKS
   ────────────────────────────────────────────── */

const steps = [
  {
    number: '01',
    title: 'Create Your Cooperative',
    description: 'Sign up in seconds. Set up your cooperative, invite members, and assign roles — admin, manager, driver, or buyer.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    number: '02',
    title: 'Track Harvests & Logistics',
    description: 'Members log harvests from the field. Assign drivers, match shipments to vehicles, and monitor warehouse capacity in real-time.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    number: '03',
    title: 'Connect & Sell',
    description: 'List your produce for buyers. Confirm orders, manage payments, and build direct relationships — cutting out the middlemen.',
    color: 'from-blue-500 to-indigo-600',
  },
]

function HowItWorksSection() {
  return (
    <section className="relative py-28 sm:py-36" aria-label="How it works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-[var(--color-secondary)]/10 px-4 py-1 text-sm font-semibold text-[var(--color-secondary)]">
              How It Works
            </span>
            <h2
              className="mb-4 font-bold tracking-tight text-[var(--color-text)]"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)' }}
            >
              Up and Running in Minutes
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              Three simple steps to transform your cooperative's supply chain.
            </p>
          </div>
        </FadeIn>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[var(--color-border)] via-[var(--color-border)] to-transparent lg:block" />

          <div className="space-y-16 lg:space-y-0">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.15}>
                <div className={`relative lg:grid lg:grid-cols-2 lg:gap-16 lg:pb-24 ${i % 2 === 0 ? '' : 'lg:direction-rtl'}`}>
                  {/* Step number dot (desktop) */}
                  <div className="absolute left-1/2 top-0 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[var(--color-background)] bg-[var(--color-primary)] text-sm font-bold text-white shadow-lg lg:flex">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className={`${i % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:col-start-2 lg:pl-16'}`} style={{ direction: 'ltr' }}>
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white shadow-md lg:hidden" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))` }}>
                      {step.number}
                    </div>
                    <h3
                      className="mb-3 font-bold text-[var(--color-text)]"
                      style={{ fontSize: 'clamp(1.25rem, 2vw + 0.5rem, 1.5rem)' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">{step.description}</p>
                  </div>

                  {/* Visual placeholder */}
                  <div className={`mt-6 lg:mt-0 ${i % 2 === 0 ? 'lg:col-start-2 lg:pl-16' : 'lg:col-start-1 lg:row-start-1 lg:pr-16 lg:text-right'}`} style={{ direction: 'ltr' }}>
                    <div className={`h-48 rounded-2xl bg-gradient-to-br ${step.color} p-[1px]`}>
                      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)]">
                        <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color} opacity-20`} />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 5: TESTIMONIALS
   ────────────────────────────────────────────── */

const testimonials = [
  {
    quote: "Agri-Tech transformed how our cooperative manages harvests. We went from paper logs to real-time tracking overnight. Our farmers love it.",
    name: 'Grace Mwangi',
    role: 'Cooperative Manager, Green Valley Co-op',
    initials: 'GM',
  },
  {
    quote: "The logistics feature alone saved us 15 hours per week. Matching drivers to shipments used to be chaos — now it's one click.",
    name: 'James Ochieng',
    role: 'Operations Lead, Sunrise Farmers',
    initials: 'JO',
  },
  {
    quote: "As a buyer, I can see exactly where my produce comes from. The transparency builds trust and I get fresher deliveries.",
    name: 'Amina Hassan',
    role: 'Procurement Director, FreshMart',
    initials: 'AH',
  },
]

function TestimonialsSection() {
  return (
    <section className="relative py-28 sm:py-36" aria-label="Testimonials">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-background)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1 text-sm font-semibold text-[var(--color-primary)]">
              Trusted by Cooperatives
            </span>
            <h2
              className="mb-4 font-bold tracking-tight text-[var(--color-text)]"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)' }}
            >
              What Our Users Say
            </h2>
          </div>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScaleIn key={t.name} delay={i * 0.12}>
              <div className="relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-8">
                {/* Quote mark */}
                <svg className="mb-4 h-8 w-8 text-[var(--color-primary)]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
                </svg>
                <p className="mb-8 text-[var(--color-text)] leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--color-text)]">{t.name}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">{t.role}</div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 6: CTA BANNER
   ────────────────────────────────────────────── */

function CTASection() {
  const { scrollYProgress } = useScroll()
  const ctaBgY = useTransform(scrollYProgress, [0.7, 1], [40, -40])

  return (
    <section className="relative py-28 sm:py-36" aria-label="Call to action">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl">
            {/* Parallax background */}
            <motion.div style={{ y: ctaBgY }} className="absolute inset-0 -top-20 -bottom-20">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[#1a4f30] to-[#0d3318]" />
              <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[var(--color-primary-hover)]/20 blur-[80px]" />
              <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[60px]" />
            </motion.div>

            <div className="relative px-8 py-20 text-center sm:px-16">
              <h2
                className="mb-6 font-bold tracking-tight text-white"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)' }}
              >
                Ready to Transform
                <span className="block">Your Supply Chain?</span>
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-lg text-white/70">
                Join hundreds of cooperatives already using Agri-Tech to track harvests,
                manage logistics, and connect directly with buyers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex min-h-[52px] items-center rounded-xl bg-white px-8 text-base font-semibold text-[var(--color-primary)] shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
                >
                  Start Free Today
                  <svg className="ml-2 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-[52px] items-center rounded-xl border border-white/25 px-8 text-base font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   SECTION 7: FOOTER
   ────────────────────────────────────────────── */

function FooterSection() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 text-lg font-bold text-[var(--color-primary)]">Agri-Tech Co-op</div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Empowering cooperatives with modern supply chain technology. From farm to market, transparently.
            </p>
            <div className="flex gap-3">
              {/* Social icons */}
              <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" aria-label="GitHub">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)]">Product</h3>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Integrations', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)]">Company</h3>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)]">Legal</h3>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border-subtle)] pt-8 text-center text-sm text-[var(--color-text-subtle)]">
          &copy; {new Date().getFullYear()} Agri-Tech Cooperative. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────────────────────────
   LANDING PAGE (EXPORTED)
   ────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
