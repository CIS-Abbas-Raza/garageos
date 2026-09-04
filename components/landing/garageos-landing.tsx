'use client'

import Link from 'next/link'
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

const plans = [
  {
    name: 'Essentials',
    description: 'The focused foundation for a well-run garage.',
    price: 'From $49',
    features: ['Customer and vehicle records', 'Appointments and job cards', 'Task management', 'Invoices and payment tracking', 'Team notifications'],
    optional: 'Add inspections or customer messaging when you are ready.',
    cta: 'Get Started',
  },
  {
    name: 'Premium',
    description: 'More visibility and control for growing teams.',
    price: 'From $99',
    features: ['Everything in Essentials +', 'Inspection reports', 'Advanced team permissions', 'Multi-location dashboards', 'Automated customer updates'],
    optional: 'Add vehicle maintenance pictures and reporting tools.',
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'A tailored operating system for complex networks.',
    price: 'Custom Quote',
    features: ['Everything in Premium +', 'Unlimited branches and users', 'Custom workflows and integrations', 'Centralized analytics', 'Dedicated success support'],
    optional: 'Configure the modules and service level your network needs.',
    cta: 'Book a Demo',
  },
]

const testimonials = [
  { initials: 'JM', name: 'Jordan Mitchell', role: 'Owner, Mitchell Motorworks', quote: 'GarageOS gave our front desk and technicians the same source of truth. We spend less time chasing paperwork and more time turning cars around.' },
  { initials: 'AS', name: 'Aisha Shah', role: 'Operations Lead, Apex Auto Care', quote: 'I can see every appointment, open task, and unpaid invoice before my first coffee. The team knows what is next without a morning scramble.' },
  { initials: 'DL', name: 'Daniel Lewis', role: 'Managing Director, Lewis & Sons Garage', quote: 'The multi-location view has changed how we run the business. Every branch stays accountable while our customers get a consistently better experience.' },
]

const faqs = [
  ['What is GarageOS and how does it work?', 'GarageOS brings customers, vehicles, appointments, work orders, employees, and billing into one workspace. Your team can access the right information from any device.'],
  ['How secure is my data?', 'GarageOS uses role-based access and secure authentication so sensitive customer and business information is only visible to the people you choose.'],
  ['Who is this platform for?', 'It is built for independent garages, repair shops, service centers, and multi-branch automotive businesses that want a clearer way to run daily work.'],
  ['Can I manage more than one location?', 'Yes. Premium and Enterprise plans make it easy to organize branches, assign work locally, and keep an owner-level view of the business.'],
  ['What kind of support do you offer?', 'Every plan includes help getting started. Premium and Enterprise customers receive priority guidance as their workflows and teams grow.'],
]

function LogoMark({ inverse = false }: { inverse?: boolean }) {
  return <Link href="#home" className={`flex items-center gap-2.5 font-bold tracking-tight ${inverse ? 'text-white' : 'text-landing-foreground'}`}><span className="flex size-9 items-center justify-center rounded-xl bg-landing-blue text-white shadow-sm"><Wrench className="size-5" /></span><span className="text-lg">Garage<span className="text-landing-blue">OS</span></span></Link>
}

// TODO: Replace this CSS dashboard preview with the final GarageOS demo video or GIF.
function DashboardMockup() {
  return <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[26px] border border-slate-700 bg-slate-950 p-2 shadow-[0_30px_90px_rgba(15,23,42,0.25)] sm:p-4"><div className="rounded-[18px] bg-white p-3 sm:p-5"><div className="flex items-center justify-between border-b border-slate-200 pb-3"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-300" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-300" /></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">Tuesday, 14 May</span></div><div className="grid gap-3 pt-4 md:grid-cols-[1.05fr_2fr]"><div className="space-y-2 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today at a glance</p><div className="grid grid-cols-2 gap-2">{[['24', 'Vehicles'], ['08', 'Open jobs'], ['06', 'Team online'], ['12', 'Appointments']].map(([value, label]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-2.5"><p className="text-lg font-bold text-slate-900">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div>)}</div><div className="mt-2 rounded-lg bg-landing-blue p-3 text-white"><p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Next up</p><p className="mt-1 text-sm font-semibold">Brake inspection</p><p className="mt-1 text-[10px] text-blue-100">Bay 03 · 10:30 AM</p></div></div><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workshop flow</p><p className="mt-1 text-base font-bold text-slate-900">Active job cards</p></div><span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">Live</span></div><div className="mt-4 space-y-2">{[['JC-4501', 'Toyota Corolla', 'In progress', 'bg-amber-50 text-amber-600'], ['JC-4502', 'Ford Transit', 'Awaiting parts', 'bg-blue-50 text-blue-600'], ['JC-4503', 'Audi A4', 'Ready for pickup', 'bg-emerald-50 text-emerald-600']].map(([id, car, status, color]) => <div key={id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-landing-blue"><Wrench className="size-3.5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-800">{id} <span className="font-normal text-slate-400">· {car}</span></p><div className="mt-1 h-1.5 rounded-full bg-slate-100"><span className={`block h-1.5 rounded-full ${status === 'In progress' ? 'w-3/5 bg-amber-400' : status === 'Awaiting parts' ? 'w-2/5 bg-blue-400' : 'w-full bg-emerald-400'}`} /></div></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${color}`}>{status}</span></div>)}</div></div></div></div></div>
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll) }, [])
  return <header className={`sticky top-0 z-50 border-b transition-all ${scrolled ? 'border-landing-line bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl' : 'border-transparent bg-white/80 backdrop-blur-md'}`}><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8"><LogoMark /><nav className="hidden items-center gap-8 md:flex">{navLinks.map(([label, href]) => <a key={href} href={href} className="text-sm font-medium text-slate-500 transition hover:text-landing-blue">{label}</a>)}</nav><div className="hidden items-center gap-2 md:flex"><Button nativeButton={false} render={<Link href="/login" />} variant="outline" size="sm" className="rounded-full border-slate-200 px-4">Login</Button><Button nativeButton={false} render={<Link href="/register" />} size="sm" className="rounded-full px-5 shadow-sm">Get Started <ArrowRight className="size-3.5" /></Button></div><button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-700 md:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>{open && <nav className="border-t border-landing-line bg-white px-5 py-4 md:hidden">{navLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700">{label}</a>)}<div className="grid grid-cols-2 gap-2 pt-4"><Button nativeButton={false} render={<Link href="/login" />} variant="outline">Login</Button><Button nativeButton={false} render={<Link href="/register" />}>Get Started</Button></div></nav>}</header>
}

function Hero() {
  return <section id="home" className="overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_72%)] px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pb-28"><div className="mx-auto max-w-7xl text-center"><p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-landing-blue"><BadgeCheck className="size-3.5" /> Built for better bays</p><h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-[-0.055em] text-landing-foreground sm:text-6xl lg:text-7xl">Run a more organized, efficient garage <span className="text-landing-blue">without the paperwork.</span></h1><p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-500 sm:text-lg">GarageOS helps garage owners and mechanics manage employees, customers, appointments, and billing from anywhere.</p><div className="mt-8"><Button nativeButton={false} render={<Link href="/register" />} size="lg" className="h-12 rounded-full px-6 text-base shadow-[0_14px_30px_rgba(37,99,235,0.25)]">Get Started <ArrowRight className="size-4" /></Button></div><div className="mt-16 overflow-hidden border-y border-slate-100 py-5"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Trusted by teams that keep moving</p><div className="flex w-max animate-[hero-marquee_24s_linear_infinite] gap-3 hover:[animation-play-state:paused]">{[...partnerGarages, ...partnerGarages].map((garage, index) => <div key={`${garage}-${index}`} className="flex min-w-[160px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold tracking-tight text-slate-500"><span className="size-2 rounded-full bg-landing-blue" />{garage}</div>)}</div></div><div className="mt-14"><DashboardMockup /></div></div></section>
}

function FeatureHighlights() {
  return <section id="features" className="bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">One calm workspace</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Smart, secure & effortless garage management.</h2><p className="mt-5 text-lg leading-8 text-slate-500">The details that keep a workshop healthy should never be scattered across notebooks, inboxes, and spreadsheets.</p></div><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{highlights.map(({ icon: Icon, title, description }, index) => <article key={title} className={`rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${index === 1 || index === 3 ? 'border-landing-blue/20 bg-blue-50/60' : 'border-slate-200 bg-white'}`}><span className="flex size-11 items-center justify-center rounded-xl bg-landing-blue text-white"><Icon className="size-5" /></span><h3 className="mt-7 text-lg font-bold tracking-tight text-landing-foreground">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></article>)}</div></div></section>
}

function PowerfulFeatures() {
  return <section className="overflow-hidden bg-slate-950 px-5 py-20 text-white lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Your day, in your hand</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Powerful features for easier operations.</h2><p className="mt-5 text-lg leading-8 text-slate-400">Give every person on your team the context to do their best work, wherever the job takes them.</p></div><div className="mt-16 grid items-center gap-12 lg:grid-cols-[1fr_280px_1fr] lg:gap-16"><div className="space-y-10">{powerfulFeatures.slice(0, 3).map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4 lg:text-right"><span className="order-2 flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300 lg:order-1 lg:ml-auto"><Icon className="size-5" /></span><div className="order-1 lg:order-2"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></div>)}</div><div className="mx-auto w-[220px] rounded-[32px] border-[7px] border-slate-700 bg-slate-900 p-2 shadow-[0_0_0_1px_rgba(147,197,253,0.2),0_30px_80px_rgba(0,0,0,0.4)]"><div className="overflow-hidden rounded-[23px] bg-slate-50 text-slate-900"><div className="bg-landing-blue px-4 pb-5 pt-7 text-white"><div className="flex justify-between"><span className="text-[10px] font-bold">GarageOS</span><Bell className="size-3" /></div><p className="mt-7 text-[10px] text-blue-100">Good morning, Alex</p><p className="mt-1 text-lg font-bold">Your workshop</p></div><div className="space-y-2 p-3"><div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[9px] text-slate-400">Open jobs</p><p className="mt-1 text-2xl font-bold">08</p><div className="mt-2 h-1 rounded-full bg-blue-100"><span className="block h-1 w-3/5 rounded-full bg-landing-blue" /></div></div>{['Bay 03 · Brake inspection', 'Bay 01 · Oil service', 'Pickup · 2 vehicles'].map((item) => <div key={item} className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-[9px] font-semibold text-slate-600">{item}</span></div>)}</div></div></div><div className="space-y-10">{powerfulFeatures.slice(3).map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300"><Icon className="size-5" /></span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></div>)}</div></div></div></section>
}

function Pricing() {
  return <section id="pricing" className="bg-slate-50 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Simple to start</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Choose the plan that fits your garage</h2><p className="mt-5 text-lg leading-8 text-slate-500">Plans are based on team size and selected modules.</p></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={`relative flex flex-col rounded-2xl border bg-white p-7 ${plan.popular ? 'border-landing-blue shadow-[0_20px_50px_rgba(37,99,235,0.14)]' : 'border-slate-200'}`}>{plan.popular && <span className="absolute -top-3 left-7 rounded-full bg-landing-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Popular</span>}<h3 className="text-xl font-bold text-landing-foreground">{plan.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p><p className="mt-6 text-2xl font-bold text-landing-foreground">{plan.price}</p><div className="my-6 h-px bg-slate-100" /><ul className="space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />{feature}</li>)}</ul><div className="mt-7 rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Optional modules</p><p className="mt-2 text-xs leading-5 text-slate-500">{plan.optional}</p></div><Button render={<Link href={plan.name === 'Enterprise' ? '#contact' : '/register'} />} variant={plan.popular ? 'default' : 'outline'} className="mt-7 w-full rounded-full">{plan.cta}<ArrowRight className="size-3.5" /></Button></article>)}</div></div></section>
}

function Testimonials() {
  return <section id="reviews" className="bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Real shop stories</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Loved by busy garages.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Less admin for owners. More clarity for teams. Better service for every customer.</p></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map((testimonial, index) => <article key={testimonial.name} className={`rounded-2xl p-7 ${index === 1 ? 'bg-landing-blue text-white' : 'border border-slate-200 bg-slate-50'}`}><div className={`flex size-12 items-center justify-center rounded-full text-sm font-bold ${index === 1 ? 'bg-white/15 text-white' : 'bg-blue-100 text-landing-blue'}`}>{testimonial.initials}</div><p className={`mt-7 text-lg leading-8 ${index === 1 ? 'text-white' : 'text-slate-700'}`}>&ldquo;{testimonial.quote}&rdquo;</p><div className="mt-8"><p className="font-bold">{testimonial.name}</p><p className={`mt-1 text-sm ${index === 1 ? 'text-blue-100' : 'text-slate-500'}`}>{testimonial.role}</p></div></article>)}</div><p className="mt-8 text-center text-xs text-slate-400">TODO: Replace initials with approved customer photos before launch.</p></div></section>
}

function CTABanner() { return <section id="contact" className="bg-landing-blue px-5 py-16 text-center text-white lg:px-8 lg:py-20"><div className="mx-auto max-w-3xl"><h2 className="text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Stay organized. Stay in control.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-blue-100">Full visibility into staff, tasks, and billing, without the complexity.</p><Button render={<Link href="/register" />} size="lg" className="mt-8 h-12 rounded-full bg-white px-6 text-base text-landing-blue hover:bg-blue-50">Get Started <ArrowRight className="size-4" /></Button></div></section> }

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return <section id="faqs" className="bg-slate-50 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-landing-blue">Answers, at a glance</p><h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.05em] text-landing-foreground sm:text-5xl">Still unsure? Here&apos;s what you need to know.</h2></div><div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-bold text-landing-foreground"><span>{question}</span><ChevronDown className={`size-5 shrink-0 text-landing-blue transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-slate-500">{answer}</p>}</div>)}</div><div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">Still have questions? <a href="mailto:hello@garageos.com" className="font-bold text-landing-blue hover:underline">Contact Us <ArrowRight className="inline size-3.5" /></a></div></div></section>
}

function Footer() { return <footer className="bg-slate-950 px-5 py-12 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]"><div><LogoMark inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">The operating system for modern auto garages. Less paperwork, more progress.</p></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Application</p><div className="mt-4 space-y-3 text-sm text-slate-300"><a className="block hover:text-white" href="#features">Features</a><a className="block hover:text-white" href="#pricing">Pricing</a><a className="block hover:text-white" href="#reviews">Reviews</a><a className="block hover:text-white" href="#faqs">FAQs</a></div></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Company</p><div className="mt-4 space-y-3 text-sm text-slate-300"><a className="block hover:text-white" href="mailto:hello@garageos.com">Contact</a><Link className="block hover:text-white" href="/login">Login</Link><Link className="block hover:text-white" href="/register">Get Started</Link></div></div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Social media</p><div className="mt-4 flex gap-2"><a aria-label="GarageOS on Facebook" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold hover:bg-white/20">f</a><a aria-label="GarageOS on Instagram" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">ig</a><a aria-label="GarageOS on LinkedIn" href="#" className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">in</a></div></div></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row"><p>&copy; 2026 GarageOS. All Rights Reserved.</p><div className="flex gap-4"><a href="#">Privacy Policy</a><a href="#">Terms &amp; Conditions</a></div></div></div></footer> }

export function GarageOSLanding() { return <div className="min-h-screen bg-white text-landing-foreground"><Navbar /><main><Hero /><FeatureHighlights /><PowerfulFeatures /><Pricing /><Testimonials /><CTABanner /><FAQAccordion /></main><Footer /></div> }