'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck2,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Layers3,
  Menu,
  MessageCircle,
  PenLine,
  ShieldCheck,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  ['Home', '#home'],
  ['Features', '#features'],
  ['Pricing', '#pricing'],
  ['Reviews', '#reviews'],
  ['FAQs', '#faqs'],
]

// TODO: Replace placeholder garage names with approved customer logos.
const partnerGarages = ['Northline Auto', 'Mile One Motors', 'The Pit Crew', 'Oak Street Garage', 'Vertex Service', 'Redline Works']

const highlights = [
  { icon: UsersRound, title: 'Manage Company Employees', description: 'Assign roles, track staff status, and keep every shift moving.' },
  { icon: CalendarCheck2, title: 'Track Appointments & Tasks', description: 'Plan and assign daily workshop work from one clear schedule.' },
  { icon: ClipboardCheck, title: 'Log Customer Service History', description: 'Keep accurate vehicle and service records ready when you need them.' },
  { icon: ShieldCheck, title: 'Grant Team Controlled Access', description: 'Give owners, advisors, and mechanics exactly the access they need.' },
  { icon: Building2, title: 'Manage Multiple Locations', description: 'Run branches, bays, and teams with a single connected view.' },
]

const powerfulFeatures = [
  { icon: FileText, title: 'Create work orders', text: 'Build clear job cards for every vehicle.' },
  { icon: BarChart3, title: 'Track daily reports', text: 'See what is moving and what needs attention.' },
  { icon: MessageCircle, title: 'Share documents', text: 'Keep customers and teams in the loop.' },
  { icon: ClipboardCheck, title: 'Create inspection reports', text: 'Capture findings and assign the next step.' },
  { icon: PenLine, title: 'Assign mechanic tasks', text: 'Put the right work in the right hands.' },
  { icon: Layers3, title: 'Run daily operations', text: 'Keep your whole workshop in sync.' },
]

type PackageInfo = { id: number; information: string; status: number }
type PackageRecord = {
  id: number
  name: string
  monthly: string | number
  yearly: string | number
  status: number
  packageInfos?: PackageInfo[]
}

const testimonials = [
  { initials: 'JM', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=128&h=128&q=80', name: 'Jordan Mitchell', role: 'Owner, Mitchell Motorworks', quote: 'GarageWorkOs gave our front desk and technicians the same source of truth. We spend less time chasing paperwork and more time turning cars around.' },
  { initials: 'AS', image: 'https://images.unsplash.com/photo-1688841146404-a3a6b72b4c6e?auto=format&fit=crop&crop=faces&w=128&h=128&q=80', name: 'Aisha Shah', role: 'Operations Lead, Apex Auto Care', quote: 'I can see every appointment, open task, and unpaid invoice before my first coffee. The team knows what is next without a morning scramble.' },
  { initials: 'DL', image: 'https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?auto=format&fit=crop&crop=faces&w=128&h=128&q=80', name: 'Daniel Lewis', role: 'Managing Director, Lewis & Sons Garage', quote: 'The multi-location view has changed how we run the business. Every branch stays accountable while our customers get a consistently better experience.' },
]

const faqs = [
  ['What is GarageWorkOs and how does it work?', 'GarageWorkOs brings customers, vehicles, appointments, work orders, employees, and billing into one workspace. Your team can access the right information from any device.'],
  ['How secure is my data?', 'GarageWorkOs uses role-based access and secure authentication so sensitive customer and business information is only visible to the people you choose.'],
  ['Who is this platform for?', 'It is built for independent garages, repair shops, service centers, and multi-branch automotive businesses that want a clearer way to run daily work.'],
  ['Can I manage more than one location?', 'Yes. Premium and Enterprise plans make it easy to organize branches, assign work locally, and keep an owner-level view of the business.'],
  ['What kind of support do you offer?', 'Every plan includes help getting started. Premium and Enterprise customers receive priority guidance as their workflows and teams grow.'],
]

function LogoMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="#home"
      aria-label="GarageWorkOs home"
      className={`flex items-center gap-2.5 font-semibold tracking-tight ${inverse ? 'text-white' : 'text-landing-foreground'}`}
    >
      <Image
        src="/garageworkos-logo.png"
        alt=""
        width={64}
        height={32}
        className={`h-8 w-auto object-contain ${inverse ? 'brightness-0 invert' : ''}`}
      />
      <span className="text-lg" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
        GarageWorkOs
      </span>
    </Link>
  )
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <Image
        src="/garageworkos-dashboard-overview.png"
        alt="GarageWorkOs dashboard overview with navigation, business metrics, and reports"
        width={1798}
        height={875}
        priority
        className="h-auto w-full drop-shadow-[0_30px_70px_rgba(15,23,42,0.18)]"
      />
    </div>
  )
}
function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll) }, [])
  return <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${scrolled ? 'border-landing-line bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'border-transparent bg-white/80 backdrop-blur-md'}`}><div className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="#home" aria-label="GarageWorkOs home" className="flex shrink-0 items-center gap-3"><Image src="/garageworkos-logo.png" alt="" width={128} height={64} priority className="h-12 w-20 object-contain" /><span className="flex flex-col gap-0.5 whitespace-nowrap"><span className="text-2xl font-bold leading-tight tracking-tight" style={{ fontFamily: '"Segoe UI", sans-serif' }}><span className="text-[#2563eb]">GarageWork</span><span className="text-[#0b1220]">Os</span></span><span className="text-xs leading-tight text-slate-500">Workshop Management System</span></span></Link><nav className="hidden items-center gap-8 md:flex">{navLinks.map(([label, href]) => <a key={href} href={href} className="text-base font-medium text-slate-500 transition hover:text-landing-blue">{label}</a>)}</nav><div className="hidden items-center gap-3 md:flex"><Button nativeButton={false} render={<Link href="/login" />} variant="outline" size="sm" className="h-10 rounded-full border-slate-200 px-5 text-sm">Login</Button><Button nativeButton={false} render={<Link href="/register" />} size="sm" className="h-10 rounded-full px-6 text-sm shadow-sm">Get Started <ArrowRight className="size-4" /></Button></div><button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-700 md:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>{open && <nav className="border-t border-landing-line bg-white px-5 py-4 md:hidden">{navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700">{label}</a>)}<div className="grid grid-cols-2 gap-2 pt-4"><Button nativeButton={false} render={<Link href="/login" />} variant="outline">Login</Button><Button nativeButton={false} render={<Link href="/register" />}>Get Started</Button></div></nav>}</header>
}

function Hero() {
  return (
    <section
      id="home"
      className="hero-grid-background px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-28"
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--hero-glow-x', `${event.clientX - bounds.left}px`)
        event.currentTarget.style.setProperty('--hero-glow-y', `${event.clientY - bounds.top}px`)
        event.currentTarget.style.setProperty('--hero-glow-opacity', '1')
      }}
      onPointerLeave={(event) => event.currentTarget.style.setProperty('--hero-glow-opacity', '0')}
    ><div className="mx-auto max-w-7xl text-center"><p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-landing-blue"><BadgeCheck className="size-3.5" /> Built for better bays</p><h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-[-0.055em] text-landing-foreground sm:text-6xl lg:text-7xl">Run a more organized, efficient garage <span className="text-landing-blue">without the paperwork.</span></h1><p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-500 sm:text-lg">GarageWorkOs helps garage owners and mechanics manage employees, customers, appointments, and billing from anywhere.</p><div className="mt-8"><Button nativeButton={false} render={<Link href="/register" />} size="lg" className="h-12 rounded-full px-6 text-base shadow-[0_14px_30px_rgba(37,99,235,0.25)]">Get Started <ArrowRight className="size-4" /></Button></div><div className="mt-16 overflow-hidden border-y border-slate-100 py-5"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Trusted by teams that keep moving</p><div className="flex w-max animate-[hero-marquee_24s_linear_infinite] gap-3 hover:[animation-play-state:paused]">{[...partnerGarages, ...partnerGarages].map((garage, index) => <div key={`${garage}-${index}`} className="flex min-w-[160px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold tracking-tight text-slate-500"><span className="size-2 rounded-full bg-landing-blue" />{garage}</div>)}</div></div><div className="mt-14"><DashboardMockup /></div></div></section>
  )
}

function FeatureHighlights() {
  return <section id="features" className="bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">One calm workspace</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Smart, secure & effortless garage management.</h2><p className="mt-5 text-lg leading-8 text-slate-500">The details that keep a workshop healthy should never be scattered across notebooks, inboxes, and spreadsheets.</p></div><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{highlights.map(({ icon: Icon, title, description }, index) => <article key={title} className={`rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${index === 1 || index === 3 ? 'border-landing-blue/20 bg-blue-50/60' : 'border-slate-200 bg-white'}`}><span className="flex size-11 items-center justify-center rounded-xl bg-landing-blue text-white"><Icon className="size-5" /></span><h3 className="mt-7 text-lg font-bold tracking-tight text-landing-foreground">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></article>)}</div></div></section>
}

type PhoneCarouselSlide = {
  label: string
  src: string
  width: number
  height: number
  alt: string
}

const phoneSlides: PhoneCarouselSlide[] = [
  {
    label: 'GarageWorkOs loader',
    src: '/phone-carousel-1.png',
    width: 285,
    height: 500,
    alt: 'GarageWorkOs branded loading screen',
  },
  {
    label: 'Dashboard overview',
    src: '/phone-carousel-2.png',
    width: 285,
    height: 500,
    alt: 'GarageWorkOs mobile dashboard overview with today’s date and revenue',
  },
  {
    label: 'Tasks report',
    src: '/phone-carousel-3.png',
    width: 285,
    height: 500,
    alt: 'GarageWorkOs mobile task status report chart',
  },
  {
    label: 'Revenue overview',
    src: '/phone-carousel-4.png',
    width: 285,
    height: 500,
    alt: 'GarageWorkOs mobile revenue and expense chart',
  },
]

function MobileScreenCarousel() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = phoneSlides[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % phoneSlides.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="mx-auto w-[220px] rounded-[32px] border-[7px] border-slate-700 bg-slate-900 p-2 shadow-[0_0_0_1px_rgba(147,197,253,0.2),0_30px_80px_rgba(0,0,0,0.4)]">
      <div className="overflow-hidden rounded-[23px] bg-white">
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          width={slide.width}
          height={slide.height}
          sizes="190px"
          priority={activeSlide === 0}
          className="block h-auto w-full"
        />
        <div className="flex h-7 items-center justify-center gap-1.5 bg-white" role="group" aria-label="Choose a phone preview slide">
          {phoneSlides.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Show slide ${index + 1}: ${item.label}`}
              aria-current={activeSlide === index ? 'true' : undefined}
              onClick={() => setActiveSlide(index)}
              className={`size-1.5 rounded-full transition-colors ${activeSlide === index ? 'bg-landing-blue' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
function PowerfulFeatures() {
  return (
    <section className="overflow-hidden bg-slate-950 px-5 py-20 text-white lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Your day, in your hand</p>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Powerful features for easier operations.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">Give every person on your team the context to do their best work, wherever the job takes them.</p>
        </div>
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1fr_280px_1fr] lg:gap-16">
          <div className="space-y-10">
            {powerfulFeatures.slice(0, 3).map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 lg:text-right">
                <span className="order-2 flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300 lg:order-1 lg:ml-auto"><Icon className="size-5" /></span>
                <div className="order-1 lg:order-2"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div>
              </div>
            ))}
          </div>
          <MobileScreenCarousel />
          <div className="space-y-10">
            {powerfulFeatures.slice(3).map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300"><Icon className="size-5" /></span>
                <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [packages, setPackages] = useState<PackageRecord[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState(false)

  useEffect(() => {
    let active = true

    fetch('/backend-api/packages?limit=100')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load packages')
        return response.json()
      })
      .then((result: { success?: boolean; data?: PackageRecord[] }) => {
        if (!active) return
        if (!result.success || !Array.isArray(result.data)) throw new Error('Invalid packages response')
        setPackages(result.data.filter((item) => Number(item.status) === 1))
      })
      .catch(() => {
        if (active) setPackagesError(true)
      })
      .finally(() => {
        if (active) setLoadingPackages(false)
      })

    return () => { active = false }
  }, [])

  const visiblePackages = packages.map((item) => ({
    ...item,
    information: (item.packageInfos ?? [])
      .filter((info) => Number(info.status) === 1)
      .map((info) => info.information?.trim())
      .filter((information): information is string => Boolean(information)),
  }))

  return (
    <section id="pricing" className="bg-slate-50 px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Simple to start</p>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Choose the plan that fits your garage</h2>
          <p className="mt-5 text-lg leading-8 text-slate-500">Compare package features and choose your billing frequency.</p>
          <div className="mt-7 inline-flex rounded-full border border-slate-200 bg-white p-1" role="group" aria-label="Pricing billing frequency">
            <button type="button" aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${billing === 'monthly' ? 'bg-landing-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Monthly</button>
            <button type="button" aria-pressed={billing === 'yearly'} onClick={() => setBilling('yearly')} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${billing === 'yearly' ? 'bg-landing-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Yearly</button>
          </div>
          <p className="mt-2 min-h-5 text-xs font-semibold text-emerald-600">{billing === 'yearly' ? 'Yearly package price' : 'Monthly package price'}</p>
        </div>

        {loadingPackages ? (
          <p className="mt-10 text-center text-sm text-slate-500" role="status">Loading packages…</p>
        ) : packagesError ? (
          <p className="mt-10 text-center text-sm text-slate-500" role="status">Packages are unavailable right now. Please try again later.</p>
        ) : visiblePackages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">No packages are currently available.</p>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {visiblePackages.map((item) => {
              const price = Number(billing === 'monthly' ? item.monthly : item.yearly)
              return (
                <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7">
                  <h3 className="text-xl font-bold text-landing-foreground">{item.name}</h3>
                  <p className="mt-6 text-3xl font-bold text-landing-foreground">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}<span className="ml-1 text-sm font-medium text-slate-500">/{billing === 'monthly' ? 'month' : 'year'}</span></p>
                  <p className="mt-1 text-xs text-slate-400">{billing === 'yearly' ? 'Billed Annually' : 'Billed Monthly'}</p>
                  <div className="my-6 h-px bg-slate-100" />
                  {item.information.length > 0 ? (
                    <ul className="space-y-3">
                      {item.information.map((information, index) => <li key={`${item.id}-${index}`} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />{information}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Package details coming soon.</p>
                  )}
                  <Button render={<Link href="/register" />} className="mt-7 w-full rounded-full">Get Started<ArrowRight className="size-3.5" /></Button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function Testimonials() {
  return <section id="reviews" className="bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Real shop stories</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Loved by busy garages.</h2></div></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map((testimonial, index) => <article key={testimonial.name} className={`rounded-2xl p-7 ${index === 1 ? 'bg-landing-blue text-white' : 'border border-slate-200 bg-slate-50'}`}><Image src={testimonial.image} alt={`Illustrative profile portrait for ${testimonial.name}`} width={48} height={48} unoptimized className={`size-12 rounded-full object-cover ${index === 1 ? 'ring-2 ring-white/25' : 'ring-2 ring-blue-100'}`} /><p className={`mt-7 text-lg leading-8 ${index === 1 ? 'text-white' : 'text-slate-700'}`}>&ldquo;{testimonial.quote}&rdquo;</p><div className="mt-8"><p className="font-bold">{testimonial.name}</p><p className={`mt-1 text-sm ${index === 1 ? 'text-blue-100' : 'text-slate-500'}`}>{testimonial.role}</p></div></article>)}</div></div></section>
}

function CTABanner() { return <section id="contact" className="bg-landing-blue px-5 py-16 text-center text-white lg:px-8 lg:py-20"><div className="mx-auto max-w-3xl"><h2 className="text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Stay organized. Stay in control.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-blue-100">Full visibility into staff, tasks, and billing, without the complexity.</p><Button render={<Link href="/register" />} size="lg" className="mt-8 h-12 rounded-full bg-white px-6 text-base text-landing-blue hover:bg-blue-50">Get Started <ArrowRight className="size-4" /></Button></div></section> }

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return <section id="faqs" className="bg-slate-50 px-5 pt-20 pb-8 lg:px-8 lg:pt-28 lg:pb-10"><div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Answers, at a glance</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Still unsure? Here&apos;s what you need to know.</h2></div><div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-bold text-landing-foreground"><span>{question}</span><ChevronDown className={`size-5 shrink-0 text-landing-blue transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-slate-500">{answer}</p>}</div>)}</div></div></section>
}

function Footer() { return <footer className="bg-slate-950 px-5 py-12 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]"><div><LogoMark inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">The operating system for modern auto garages. Less paperwork, more progress.</p></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Application</p><div className="mt-4 space-y-3 text-sm text-slate-300"><a className="block hover:text-white" href="#features">Features</a><a className="block hover:text-white" href="#pricing">Pricing</a><a className="block hover:text-white" href="#reviews">Reviews</a><a className="block hover:text-white" href="#faqs">FAQs</a></div></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Company</p><div className="mt-4 space-y-3 text-sm text-slate-300"><a className="block hover:text-white" href="mailto:hello@garageos.com">Contact</a><Link className="block hover:text-white" href="/login">Login</Link><Link className="block hover:text-white" href="/register">Get Started</Link></div></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Social media</p><div className="mt-4 flex gap-2"><a aria-label="GarageWorkOs on Facebook" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold hover:bg-white/20">f</a><a aria-label="GarageWorkOs on Instagram" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">ig</a><a aria-label="GarageWorkOs on LinkedIn" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">in</a></div></div></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row"><p>&copy; 2026 GarageWorkOs. All Rights Reserved.</p><div className="flex gap-4"><a href="#">Privacy Policy</a><a href="#">Terms &amp; Conditions</a></div></div></div></footer> }

export function GarageWorkOsLanding() { return <div className="min-h-screen bg-white text-landing-foreground"><Navbar /><main className="pt-[84px]"><Hero /><FeatureHighlights /><PowerfulFeatures /><Pricing /><Testimonials /><CTABanner /><FAQAccordion /></main><Footer /></div> }
