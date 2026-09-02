'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  FileText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type MockupCardProps = {
  title: string
  subtitle: string
  accent: string
  delay: number
  isVisible: boolean
  variant?: 'left' | 'center' | 'right'
}

const partnerLogos = ['AutoCare Pro', 'RoadReady', 'Summit Motors', 'TorqueWorks', 'BlueLine Auto', 'Motive Bay', 'DriveCore', 'ServiceOne']

function LogoMarquee() {
  return (
    <div className="hero-fade hero-fade-5 mt-10 overflow-hidden">
      <div className="logo-marquee mx-auto max-w-5xl gap-3 rounded-full border border-border/70 bg-card/40 px-4 py-3 backdrop-blur-sm md:px-6">
        {[...partnerLogos, ...partnerLogos].map((logo, index) => (
          <span
            key={`${logo}-${index}`}
            className="logo-marquee-item inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-border bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground opacity-60 transition-opacity duration-200 hover:opacity-100 md:text-xs"
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  )
}

function BrowserMockup({ title, subtitle, accent, delay, isVisible, variant = 'left' }: MockupCardProps) {
  return (
    <div
      className={`browser-card ${variant === 'center' ? 'browser-card-center' : ''} ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="overflow-hidden rounded-[20px] border border-primary/10 bg-slate-950/90 shadow-[0_18px_45px_rgba(15,23,42,0.36)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/80 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        </div>

        <div className="space-y-3 bg-slate-950 p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-xl p-2 ${accent}`}>
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
                <p className="text-[10px] text-slate-500">{subtitle}</p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-900 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-300">
              Live
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['Revenue', '$68K'],
              ['Jobs', '12'],
              ['Vehicles', '24'],
              ['Util', '82%'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-900/80 p-2.5">
                <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400">Open jobs</span>
              <span className="text-[9px] text-emerald-400">+18.4%</span>
            </div>
            <div className="mt-3 space-y-2">
              {['JC-4508 · Brake service', 'JC-4511 · Oil change', 'JC-4514 · Diagnostics'].map((job) => (
                <div key={job} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-[10px] text-slate-300">
                  <span>{job}</span>
                  <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] uppercase text-slate-300">Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingHero() {
  const showcaseRef = useRef<HTMLDivElement | null>(null)
  const [showcaseVisible, setShowcaseVisible] = useState(false)

  useEffect(() => {
    const node = showcaseRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowcaseVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden bg-background px-4 pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_52%)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="hero-fade hero-fade-1 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Smarter shop operations, from first call to final invoice
          </div>

          <h1 className="hero-fade hero-fade-2 mt-7 text-balance text-4xl font-bold tracking-[-0.06em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Run your garage smarter</span>
            <span className="block text-primary">without the chaos.</span>
          </h1>

          <p className="hero-fade hero-fade-3 mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-muted-foreground md:text-lg">
            GarageOS brings job cards, invoicing, customer records, and vehicle management together in one place for busy repair shops and service bays.
          </p>

          <div className="hero-fade hero-fade-4 mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-full px-6 text-base shadow-[0_12px_30px_rgba(59,130,246,0.25)] transition-all duration-200 hover:scale-[1.05] hover:shadow-[0_18px_36px_rgba(59,130,246,0.3)]"
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <LogoMarquee />
        </div>

        <div
          ref={showcaseRef}
          className={`hero-showcase hero-fade hero-fade-5 mx-auto mt-12 max-w-6xl ${showcaseVisible ? 'is-visible' : ''}`}
        >
          <div className="rounded-[32px] border border-primary/15 bg-slate-950 p-3 shadow-[0_0_0_1px_rgba(59,130,246,0.08),0_28px_80px_rgba(15,23,42,0.28)] md:p-5">
            <div className="grid gap-4 md:grid-cols-3 md:items-end">
              <BrowserMockup
                title="Dashboard"
                subtitle="Overview"
                accent="bg-primary/10 text-primary"
                delay={0}
                isVisible={showcaseVisible}
                variant="left"
              />
              <BrowserMockup
                title="Job cards"
                subtitle="Bay board"
                accent="bg-primary/10 text-primary"
                delay={150}
                isVisible={showcaseVisible}
                variant="center"
              />
              <BrowserMockup
                title="Invoices"
                subtitle="Payments"
                accent="bg-primary/10 text-primary"
                delay={300}
                isVisible={showcaseVisible}
                variant="right"
              />
            </div>

            <div className="mt-8 px-2 pb-2 md:px-4 md:pb-4">
              <h2 className="text-balance text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
                <span className="block">Manage your garage</span>
                <span className="block text-primary">from day one.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Track jobs, monitor invoices, and keep every customer and vehicle record connected from one streamlined workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
