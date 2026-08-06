'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useGarageStore } from '@/lib/store/garage-store'

export function ReportsPage() {
  const { invoices, payments } = useGarageStore()
  const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const average = invoices.length ? total / invoices.length : 0
  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title="Sales Report" /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-7xl"><p className="text-sm font-medium text-primary">Finance</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Sales Report</h1><p className="mt-2 text-muted-foreground">Revenue and payment performance based on your live invoice data.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{[['Invoiced', `$${total.toLocaleString()}`], ['Collected', `$${collected.toLocaleString()}`], ['Average invoice', `$${average.toFixed(0)}`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></div>)}</div><div className="mt-6 rounded-2xl border border-border bg-card p-6"><h2 className="font-semibold">Invoice performance</h2><div className="mt-5 space-y-3">{['paid', 'partially-paid', 'sent', 'overdue', 'draft'].map((status) => { const count = invoices.filter((invoice) => invoice.status === status).length; return <div key={status} className="flex items-center gap-4"><span className="w-32 text-sm capitalize text-muted-foreground">{status.replace('-', ' ')}</span><div className="h-3 flex-1 rounded-full bg-muted"><div className="h-3 rounded-full bg-primary" style={{ width: `${invoices.length ? Math.max(4, count / invoices.length * 100) : 0}%` }} /></div><span className="w-8 text-right text-sm font-semibold">{count}</span></div> })}</div></div></div></main></div></div>
}
