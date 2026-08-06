'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  Phone,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'

const features = [
  [Wrench, 'Digital Job Cards', 'From complaint to completion — track every step, part, and photo.'],
  [Car, 'Vehicle 360°', 'Full service history, mileage, insurance and inspection reports.'],
  [Boxes, 'Smart Inventory', 'Real-time stock, reorder alerts, and supplier workflows.'],
  [Receipt, 'Beautiful Invoicing', 'Branded, printable invoices with tax, discounts, and payments.'],
  [CalendarDays, 'Appointments', 'Bay-aware scheduling that keeps your mechanics busy.'],
  [BarChart3, 'Reports & Insights', 'Revenue, utilization, and performance across every branch.'],
  [Users, 'Roles & Teams', 'Granular permissions for advisors, mechanics, and admins.'],
  [ShieldCheck, 'Enterprise Security', 'SSO, audit logs, and role-based access on every plan.'],
] as const

const packages = [
  ['Oil, filters, checks', 'Quick Service', '$39', ['Multi-point inspection', 'Fluid top-ups', 'OBD-II scan']],
  ['Every 30k mi / 50k km', 'Major Service', '$189', ['Full fluid change', 'Belts & filters', 'Brake & tyre report']],
  ['Buy with confidence', 'Pre-Purchase Inspection', '$129', ['150-point report', 'Diagnostic scan', 'Test drive notes']],
] as const

const plans = [
  ['Starter', 'For single-shop operations', '$49', ['Up to 5 users', '1 branch', 'Job cards & invoicing', 'Basic reports', 'Email support']],
  ['Growth', 'For growing multi-bay shops', '$149', ['Up to 25 users', '3 branches', 'Inventory & suppliers', 'Appointments', 'Advanced reports', 'Priority support']],
  ['Enterprise', 'For chains and franchises', '$399', ['Unlimited users & branches', 'SSO & audit logs', 'Custom roles', 'API access', 'Dedicated CSM']],
] as const

const testimonials = [
  ['MB', 'Marcus Bennett', 'Owner · Bennett Auto', 'We closed our books 4× faster in the first month. My mechanics actually enjoy using it.'],
  ['PR', 'Priya Ramanathan', 'GM · Alpine Garage', 'GarageOS gave us the visibility to open two more branches without losing control.'],
  ['DM', 'Diego Martín', 'Founder · PitStop Motors', 'Inventory alone paid for the whole subscription. Zero stock-outs in six months.'],
] as const

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-landing-foreground">
      <span className="flex size-10 items-center justify-center rounded-full bg-landing-blue text-white shadow-sm">
        <Wrench className="size-5" />
      </span>
      <span className="text-xl font-bold tracking-tight">GarageOS</span>
    </Link>
  )
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const links = [['Features', '#features'], ['Packages', '#packages'], ['Pricing', '#pricing'], ['FAQ', '#faq'], ['Contact', '#contact']]
  return (
    <header className="sticky top-0 z-50 border-b border-landing-line bg-landing-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="text-sm font-medium text-landing-muted transition hover:text-landing-blue">{label}</a>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/login" className="text-sm font-semibold text-landing-foreground hover:text-landing-blue">Sign in</Link>
          <Link href="/register" className="rounded-full bg-landing-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">Start free trial</Link>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-landing-foreground md:hidden" aria-label="Toggle navigation">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && <nav className="border-t border-landing-line px-5 py-4 md:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block py-3 text-sm font-semibold text-landing-foreground">{label}</a>)}<Link href="/login" className="block py-3 text-sm font-semibold text-landing-foreground">Sign in</Link><Link href="/register" className="mt-2 block rounded-full bg-landing-blue px-5 py-3 text-center text-sm font-semibold text-white">Start free trial</Link></nav>}
    </header>
  )
}

function DashboardPreview() {
  const stats = [['REVENUE MTD', '$68,400', '+11.7% vs last month'], ['ACTIVE JOBS', '12', '+3 vs last month'], ['VEHICLES TODAY', '24', '+8 vs last month'], ['UTILIZATION', '82%', '+4pt vs last month']]
  return <div className="mx-auto mt-16 max-w-6xl overflow-hidden rounded-3xl border border-landing-line bg-white text-left shadow-[0_24px_70px_rgba(15,23,42,0.12)]"><div className="flex items-center gap-2 border-b border-landing-line px-5 py-4"><i className="size-3 rounded-full bg-[#f87171]" /><i className="size-3 rounded-full bg-[#fbbf24]" /><i className="size-3 rounded-full bg-[#4ade80]" /><span className="ml-5 text-xs text-landing-muted">app.garageos.com/dashboard</span></div><div className="grid grid-cols-2 divide-x divide-y divide-landing-line md:grid-cols-4 md:divide-y-0">{stats.map(([label, value, delta]) => <div key={label} className="p-6"><p className="text-xs font-semibold tracking-wide text-landing-muted">{label}</p><p className="mt-2 text-2xl font-bold text-landing-foreground md:text-3xl">{value}</p><p className="mt-2 text-xs font-medium text-landing-green">{delta}</p></div>)}</div><div className="grid gap-4 bg-[#f8fafc] p-5 md:grid-cols-3">{['JC-4501 · Assigned to Ravi', 'JC-4502 · Assigned to Sofia', 'JC-4503 · Assigned to Ken'].map((job, i) => <div key={job} className="rounded-2xl border border-landing-line bg-white p-5"><div className="mb-4 flex items-center justify-between"><span className="size-8 rounded-lg bg-landing-blue-soft" /><span className="text-xs font-medium text-landing-green">{i === 0 ? 'In progress' : 'Scheduled'}</span></div><p className="text-sm font-semibold text-landing-foreground">{job}</p><p className="mt-2 text-xs text-landing-muted">Brake inspection · Bay {i + 1}</p></div>)}</div></div>
}

export function Hero() {
  return <section className="bg-landing-background px-5 pb-24 pt-24 lg:px-8 lg:pt-32"><div className="mx-auto max-w-5xl text-center"><div className="mx-auto inline-flex items-center gap-2 rounded-full bg-landing-blue-soft px-4 py-2 text-sm font-semibold text-landing-blue"><Sparkles className="size-4" />New: AI-assisted diagnostics</div><h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold leading-[1.03] tracking-[-0.055em] text-landing-foreground sm:text-6xl lg:text-7xl">The operating system for modern auto garages.</h1><p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-landing-muted">Manage job cards, inventory, appointments, and invoicing across every branch — with the polish your customers expect.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-landing-blue px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">Start 14-day free trial <ArrowRight className="size-4" /></Link><a href="#features" className="inline-flex items-center justify-center rounded-full border border-landing-line bg-white px-6 py-3.5 text-sm font-semibold text-landing-foreground transition hover:border-landing-blue hover:text-landing-blue">See how it works</a></div></div><DashboardPreview /></section>
}

function SectionIntro({ label, title, body, center = false }: { label: string; title: string; body: string; center?: boolean }) { return <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}><p className="text-sm font-bold uppercase tracking-[0.18em] text-landing-blue">{label}</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.04em] text-landing-foreground sm:text-5xl">{title}</h2><p className="mt-5 text-pretty text-lg leading-8 text-landing-muted">{body}</p></div> }

export function Features() { return <section id="features" className="scroll-mt-20 border-t border-landing-line bg-[#f8fafc] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionIntro label="Features" title="Everything you need to run a modern shop." body="From the first customer call to the final invoice, GarageOS keeps every part of your operation moving." /><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(([Icon, title, body]) => <div key={title} className="rounded-2xl border border-landing-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><span className="flex size-11 items-center justify-center rounded-xl bg-landing-blue-soft text-landing-blue"><Icon className="size-5" /></span><h3 className="mt-5 font-bold text-landing-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-landing-muted">{body}</p></div>)}</div></div></section> }

export function ServicePackages() { return <section id="packages" className="scroll-mt-20 bg-white px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionIntro label="Service Packages" title="Ready-to-use service menus for your shop." body="Launch on day one with pre-built packages you can customize per branch." /><div className="mt-14 grid gap-5 lg:grid-cols-3">{packages.map(([tag, title, price, items]) => <div key={title} className="rounded-2xl border border-landing-line bg-white p-7 shadow-sm"><p className="text-sm text-landing-muted">{tag}</p><h3 className="mt-5 text-2xl font-bold text-landing-foreground">{title}</h3><p className="mt-4 text-3xl font-bold text-landing-foreground">Starting at {price}</p><ul className="mt-7 space-y-3">{items.map(item => <li key={item} className="flex items-center gap-3 text-sm text-landing-muted"><Check className="size-4 text-landing-green" />{item}</li>)}</ul></div>)}</div></div></section> }

export function Pricing() { return <section id="pricing" className="scroll-mt-20 bg-[#f8fafc] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionIntro center label="Pricing" title="Simple, transparent pricing." body="Every plan includes a 14-day free trial. Cancel any time." /><div className="mt-14 grid items-start gap-5 lg:grid-cols-3">{plans.map(([name, description, price, items], index) => <div key={name} className={`relative rounded-2xl border bg-white p-7 ${index === 1 ? 'border-landing-blue shadow-xl lg:-translate-y-3' : 'border-landing-line'}`}>{index === 1 && <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-landing-blue-soft px-3 py-1 text-xs font-bold text-landing-blue"><Zap className="size-3" />Popular</span>}<h3 className="text-2xl font-bold text-landing-foreground">{name}</h3><p className="mt-2 text-sm text-landing-muted">{description}</p><p className="mt-8 text-4xl font-bold text-landing-foreground">{price}<span className="text-sm font-medium text-landing-muted">/month</span></p><ul className="mt-8 space-y-3">{items.map(item => <li key={item} className="flex items-center gap-3 text-sm text-landing-muted"><Check className="size-4 text-landing-green" />{item}</li>)}</ul><Link href="/register" className={`mt-9 block rounded-full px-5 py-3 text-center text-sm font-semibold ${index === 1 ? 'bg-landing-blue text-white' : 'border border-landing-line text-landing-foreground hover:border-landing-blue hover:text-landing-blue'}`}>Start free trial</Link></div>)}</div></div></section> }

export function Testimonials() { return <section className="bg-white px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><SectionIntro label="Loved by shop owners" title="Powering thousands of service bays." body="" /><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map(([initials, name, role, quote]) => <figure key={name} className="rounded-2xl border border-landing-line bg-white p-7"><div className="flex gap-1 text-landing-amber" aria-label="5 star rating">{Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}</div><blockquote className="mt-6 text-lg italic leading-8 text-landing-foreground">“{quote}”</blockquote><figcaption className="mt-8 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-landing-blue-soft text-xs font-bold text-landing-blue">{initials}</span><span><strong className="block text-sm text-landing-foreground">{name}</strong><span className="text-sm text-landing-muted">{role}</span></span></figcaption></figure>)}</div></div></section> }

export function About() { const highlights: Array<[LucideIcon, string, string]> = [[Building2, 'Multi-tenant', 'Isolated per company'], [Users, 'Team-ready', 'Roles & permissions'], [ShieldCheck, 'Secure by design', 'Protected every day'], [BarChart3, 'Actionable insights', 'Know what to improve']]; return <section className="bg-[#f8fafc] px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center"><SectionIntro label="About" title="Built by shop owners, for shop owners." body="GarageOS started in a two-bay garage in Austin — built by people who lived the paperwork, the parts hunt, and the estimate emails, and built the tool they wished they’d had." /><div className="grid grid-cols-2 gap-4">{highlights.map(([Icon, title, body]) => <div key={title} className="rounded-2xl border border-landing-line bg-white p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-landing-blue-soft text-landing-blue"><Icon className="size-5" /></span><h3 className="mt-5 text-sm font-bold text-landing-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-landing-muted">{body}</p></div>)}</div></div></section> }

export function Contact() { const contactItems: Array<[LucideIcon, string]> = [[Mail, 'sales@garageos.com'], [Phone, '+1 (415) 555-0134'], [MapPin, '500 Congress Ave, Austin, TX']]; const [sent, setSent] = useState(false); const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); toast.success('Message sent — our team will be in touch.'); event.currentTarget.reset() }; return <section id="contact" className="scroll-mt-20 bg-white px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><SectionIntro label="Contact" title="Talk to our team." body="Get a personalized demo, ask about pricing, or migrate from your current tool." /><div className="mt-10 space-y-5">{contactItems.map(([Icon, text]) => <div key={text} className="flex items-center gap-3 text-sm text-landing-muted"><Icon className="size-5 text-landing-blue" />{text}</div>)}</div></div><form onSubmit={submit} className="rounded-3xl border border-landing-line bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-landing-foreground">First name<input required name="firstName" className="mt-2 w-full rounded-xl border border-landing-line px-4 py-3 font-normal outline-none placeholder:text-landing-muted focus:border-landing-blue" placeholder="Alex" /></label><label className="text-sm font-semibold text-landing-foreground">Last name<input required name="lastName" className="mt-2 w-full rounded-xl border border-landing-line px-4 py-3 font-normal outline-none placeholder:text-landing-muted focus:border-landing-blue" placeholder="Morgan" /></label><label className="text-sm font-semibold text-landing-foreground sm:col-span-2">Work email<input required type="email" name="email" className="mt-2 w-full rounded-xl border border-landing-line px-4 py-3 font-normal outline-none placeholder:text-landing-muted focus:border-landing-blue" placeholder="you@shop.com" /></label><label className="text-sm font-semibold text-landing-foreground sm:col-span-2">Shop name<input required name="shop" className="mt-2 w-full rounded-xl border border-landing-line px-4 py-3 font-normal outline-none placeholder:text-landing-muted focus:border-landing-blue" placeholder="Your garage" /></label><label className="text-sm font-semibold text-landing-foreground sm:col-span-2">Message<textarea required name="message" rows={4} className="mt-2 w-full resize-none rounded-xl border border-landing-line px-4 py-3 font-normal outline-none placeholder:text-landing-muted focus:border-landing-blue" placeholder="Tell us how we can help..." /></label></div><button type="submit" className="mt-6 w-full rounded-full bg-landing-blue px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90">{sent ? 'Message sent' : 'Send message'}</button></form></div></section> }

export function FAQ() { const [active, setActive] = useState<number | null>(0); const questions = [['Can I try GarageOS before subscribing?', 'Yes. Every plan includes a full 14-day free trial with no credit card required.'], ['Can I manage multiple branches?', 'Growth and Enterprise plans let you manage branches, teams, inventory, and reporting from one workspace.'], ['Can you migrate our existing data?', 'Our team can help import customers, vehicles, inventory, and open jobs from your current system.']]; return <section id="faq" className="scroll-mt-20 bg-[#f8fafc] px-5 py-24 lg:px-8"><div className="mx-auto max-w-3xl"><SectionIntro center label="FAQ" title="Questions, answered." body="" /><div className="mt-12 divide-y divide-landing-line rounded-2xl border border-landing-line bg-white px-6">{questions.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setActive(active === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left text-sm font-bold text-landing-foreground"><span>{question}</span><ChevronDown className={`size-4 shrink-0 text-landing-blue transition ${active === index ? 'rotate-180' : ''}`} /></button>{active === index && <p className="-mt-2 pb-6 pr-8 text-sm leading-7 text-landing-muted">{answer}</p>}</div>)}</div></div></section> }

export function Footer() { return <footer className="border-t border-landing-line bg-white px-5 py-14 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-landing-muted">The operating system for modern auto garages.</p></div>{[['Product', 'Features', 'Packages', 'Pricing'], ['Company', 'About', 'Contact', 'Careers'], ['Legal', 'Privacy', 'Terms', 'Security']].map(([heading, ...items]) => <div key={heading}><h3 className="text-sm font-bold text-landing-foreground">{heading}</h3><div className="mt-4 space-y-3">{items.map(item => <a key={item} href="#" className="block text-sm text-landing-muted hover:text-landing-blue">{item}</a>)}</div></div>)}</div><div className="mx-auto mt-12 max-w-7xl border-t border-landing-line pt-6 text-sm text-landing-muted">© 2026 GarageOS Inc. All rights reserved.</div></footer> }
