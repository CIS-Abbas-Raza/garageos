'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, ClipboardList, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DashboardView = {
  id: string
  name: string
  path: string
  icon: typeof BarChart3
  stats: { value: string; label: string }[]
  detail: string
}

const dashboardViews: DashboardView[] = [
  {
    id: 'overview',
    name: 'Dashboard overview',
    path: 'dashboard',
    icon: BarChart3,
    stats: [
      { value: '$68,400', label: 'Revenue MTD' },
      { value: '12', label: 'Active jobs' },
      { value: '24', label: 'Vehicles today' },
      { value: '82%', label: 'Utilization' },
    ],
    detail: 'Revenue is up 18.4% compared with last month.',
  },
  {
    id: 'jobs',
    name: 'Job card kanban',
    path: 'job-cards',
    icon: ClipboardList,
    stats: [
      { value: '8', label: 'Pending' },
      { value: '14', label: 'In progress' },
      { value: '6', label: 'Ready for pickup' },
      { value: '32', label: 'Completed this month' },
    ],
    detail: 'Two vehicles are ready for customer pickup today.',
  },
  {
    id: 'invoices',
    name: 'Invoice management',
    path: 'invoices',
    icon: FileText,
    stats: [
      { value: '$45,200', label: 'Outstanding' },
      { value: '$68,400', label: 'Paid this month' },
      { value: '28', label: 'Pending invoices' },
      { value: '3.2d', label: 'Avg payment time' },
    ],
    detail: 'Your average payment time is down 1.1 days this month.',
  },
]

export function LandingHero() {
  const [currentView, setCurrentView] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = window.setInterval(() => {
      setCurrentView((current) => (current + 1) % dashboardViews.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [isPaused])

  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="hero-blob hero-blob-one absolute left-[8%] top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="hero-blob hero-blob-two absolute right-[8%] top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="hero-blob hero-blob-three absolute bottom-10 left-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="hero-enter hero-enter-1 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>New: AI-assisted diagnostics</span>
          </div>

          <div className="hero-enter hero-enter-2 mt-8 space-y-5">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              The operating system for modern auto garages.
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              Manage job cards, inventory, appointments, and invoicing across every branch
              — with the polish your customers expect.
            </p>
          </div>

          <div className="hero-enter hero-enter-3 mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Start 14-day free trial
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See how it works
            </Button>
          </div>

          <div className="hero-enter hero-enter-4 mt-12 w-full max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Trusted by growing garages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-semibold tracking-tight text-muted-foreground/65 sm:justify-between">
              <span>AutoCare Pro</span>
              <span>FastFix</span>
              <span>TurboService</span>
              <span>Elite Motors</span>
              <span>QuickRepair</span>
            </div>
          </div>
        </div>

        <div
          className="hero-enter hero-enter-5 mx-auto mt-16 max-w-6xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="rounded-2xl border border-border/80 bg-card/80 p-2 shadow-2xl shadow-primary/10 backdrop-blur-sm md:p-3">
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 md:px-5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="h-2.5 w-2.5 rounded-full bg-landing-amber" />
                <span className="h-2.5 w-2.5 rounded-full bg-landing-green" />
                <div className="ml-3 min-w-0 flex-1 rounded-md border border-border bg-muted/50 px-3 py-1 text-left text-[10px] text-muted-foreground md:text-xs">
                  garageos.com/<span aria-live="polite">{dashboardViews[currentView].path}</span>
                </div>
              </div>

              <div className="relative h-[19rem] overflow-hidden p-4 md:h-[23rem] md:p-7">
                {dashboardViews.map((dashboard, index) => {
                  const Icon = dashboard.icon
                  const isActive = index === currentView
                  return (
                    <div
                      key={dashboard.id}
                      className={`absolute inset-0 flex flex-col gap-5 p-4 transition-all duration-500 md:p-7 ${
                        isActive ? 'translate-x-0 opacity-100' : index < currentView ? '-translate-x-5 opacity-0' : 'translate-x-5 opacity-0'
                      }`}
                      aria-hidden={!isActive}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground md:text-base">{dashboard.name}</p>
                            <p className="text-xs text-muted-foreground">Monday, October 14</p>
                          </div>
                        </div>
                        <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">Live data</span>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        {dashboard.stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col justify-center rounded-xl border border-border bg-card p-3 md:p-5">
                            <span className="text-xl font-bold tracking-tight text-foreground md:text-3xl">{stat.value}</span>
                            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:text-xs">{stat.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-muted-foreground md:text-sm">
                        {dashboard.detail}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Product preview views">
            {dashboardViews.map((dashboard, index) => (
              <button
                key={dashboard.id}
                type="button"
                role="tab"
                aria-selected={index === currentView}
                aria-label={`Show ${dashboard.name}`}
                onClick={() => setCurrentView(index)}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${index === currentView ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {dashboardViews[currentView].name}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-blob-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(28px, -18px, 0) scale(1.08); }
        }
        .hero-enter { opacity: 0; animation: hero-enter 450ms ease-out forwards; }
        .hero-enter-1 { animation-delay: 50ms; }
        .hero-enter-2 { animation-delay: 120ms; }
        .hero-enter-3 { animation-delay: 190ms; }
        .hero-enter-4 { animation-delay: 260ms; }
        .hero-enter-5 { animation-delay: 330ms; }
        .hero-blob { animation: hero-blob-drift 9s ease-in-out infinite; }
        .hero-blob-two { animation-delay: -3s; }
        .hero-blob-three { animation-delay: -6s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-enter, .hero-blob { animation: none; opacity: 1; }
          .transition-all, .transition-opacity { transition: none; }
        }
      `}</style>
    </section>
  )
}
