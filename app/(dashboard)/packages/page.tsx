'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { toast } from 'sonner'

export default function PackagesPage() {
  const [packages, setPackages] = useState([{ id: 'quick', name: 'Quick Service', price: 39, duration: '45 min', active: true }, { id: 'major', name: 'Major Service', price: 189, duration: '2 hr', active: true }])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const addPackage = () => { if (!name || !price) { toast.error('Add a package name and price.'); return }; setPackages([...packages, { id: Date.now().toString(), name, price: Number(price), duration: '1 hr', active: true }]); setName(''); setPrice(''); toast.success('Package created successfully') }
  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title="Service Packages" /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-semibold tracking-tight">Service Packages</h1><p className="mt-2 text-muted-foreground">Create reusable service menus for estimates and job cards.</p><div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Add package</h2><div className="mt-5 flex flex-col gap-4"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Package name" className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" /><input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Starting price" className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" /><button onClick={addPackage} className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground">Create package</button></div></div><div className="grid gap-4 sm:grid-cols-2">{packages.map((item) => <div key={item.id} className="rounded-2xl border border-border bg-card p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.duration}</p></div><button onClick={() => { setPackages(packages.filter((entry) => entry.id !== item.id)); toast.success('Package deleted') }} className="text-sm text-destructive">Delete</button></div><p className="mt-8 text-3xl font-semibold">${item.price}</p><p className="mt-1 text-sm text-muted-foreground">Starting price</p></div>)}</div></div></div></main></div></div>
}
