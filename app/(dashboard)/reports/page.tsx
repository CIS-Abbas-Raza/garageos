'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useGarageStore } from '@/lib/store/garage-store'

export default function ReportsPage() {
  const { invoices, jobCards, appointments, parts, customers } = useGarageStore()
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0)
  const outstanding = invoices.reduce((sum, invoice) => sum + Math.max(0, invoice.total - invoice.amountPaid), 0)
  const completed = jobCards.filter((job) => job.status === 'completed').length
  const lowStock = parts.filter((part) => part.quantity <= part.minStock).length
  const cards = [['Collected revenue', `$${revenue.toLocaleString()}`], ['Outstanding balance', `$${outstanding.toLocaleString()}`], ['Completed jobs', String(completed)], ['Low stock alerts', String(lowStock)]]
  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title="Reports" /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-7xl"><div><p className="text-sm font-medium text-primary">Live business intelligence</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Reports</h1><p className="mt-2 text-muted-foreground">A clear view of revenue, workload, customers, and inventory health.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></div>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="font-semibold">Operational snapshot</h2><div className="mt-5 space-y-4"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Customers</span><strong>{customers.length}</strong></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Scheduled appointments</span><strong>{appointments.length}</strong></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Active jobs</span><strong>{jobCards.filter((job) => job.status !== 'completed').length}</strong></div></div></div><div className="rounded-2xl border border-border bg-card p-6"><h2 className="font-semibold">Payment status</h2><div className="mt-5 space-y-3">{['paid', 'partially-paid', 'sent', 'overdue'].map((status) => <div key={status} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm"><span className="capitalize">{status.replace('-', ' ')}</span><strong>{invoices.filter((invoice) => invoice.status === status).length}</strong></div>)}</div></div></div></div></main></div></div>
}
