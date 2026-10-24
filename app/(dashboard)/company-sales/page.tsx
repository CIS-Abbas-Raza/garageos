'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, FileText } from 'lucide-react'
import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

type PackageSaleRow = {
  amount: number | string
  createdAt: string
}

type Tab = 'report' | 'analysis'

const salesConfig = {
  resource: 'companySales',
  apiEndpoint: '/backend-api/company-sales',
  title: 'Company Sales',
  description: 'View package sales recorded for companies.',
  hideHeader: true,
  hideCreateButton: true,
  hideRowActions: true,
  hideStatusFilter: true,
  fields: [
    { key: 'package_history_id', label: 'Package History ID' },
    { key: 'package_name', label: 'Package Name' },
    { key: 'package_type', label: 'Type' },
    { key: 'company_name', label: 'Company' },
    { key: 'amount', label: 'Amount', type: 'number' as const },
    { key: 'status', label: 'Status' },
  ],
  columns: ['id', 'package_history_id', 'package_name', 'package_type', 'company_name', 'amount', 'status', 'createdAt'],
  empty: 'No company sales found.',
}

export default function CompanySalesPage() {
  const [tab, setTab] = useState<Tab>('report')
  const [sales, setSales] = useState<PackageSaleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const year = new Date().getFullYear()

  useEffect(() => {
    if (tab !== 'analysis') return
    let cancelled = false
    setLoading(true)
    setLoadError('')

    fetch('/backend-api/company-sales')
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok || body.success === false) {
          throw new Error(body.message || 'Unable to load company sales.')
        }
        return Array.isArray(body.data) ? body.data as PackageSaleRow[] : []
      })
      .then((rows) => {
        if (!cancelled) setSales(rows)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load company sales.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tab])

  const monthlySales = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, month) => ({
      month: new Date(year, month, 1).toLocaleString(undefined, { month: 'short' }),
      total: 0,
    }))

    for (const sale of sales) {
      const date = new Date(sale.createdAt)
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) continue
      months[date.getMonth()].total += Number(sale.amount) || 0
    }
    return months
  }, [sales, year])

  const annualTotal = monthlySales.reduce((sum, month) => sum + month.total, 0)
  const currency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Sales</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">View package sales recorded for companies.</p>
          </div>
          <div className="inline-flex w-fit items-center rounded-lg bg-muted p-1" role="tablist" aria-label="Company sales view">
            <button type="button" role="tab" aria-selected={tab === 'report'} onClick={() => setTab('report')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary/30 ${tab === 'report' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <FileText className="size-4" /> Report
            </button>
            <button type="button" role="tab" aria-selected={tab === 'analysis'} onClick={() => setTab('analysis')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary/30 ${tab === 'analysis' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <BarChart3 className="size-4" /> Analysis
            </button>
          </div>
        </div>

        {tab === 'report' ? (
          <EntityCrudPage flush config={salesConfig} />
        ) : (
          <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Monthly Sales</h2>
                <p className="text-sm text-muted-foreground">Completed package sales by month in {year}.</p>
              </div>
              <div className="rounded-lg bg-primary/5 px-4 py-2">
                <p className="text-xs text-muted-foreground">Total sales · {year}</p>
                <p className="text-lg font-bold text-foreground">{currency(annualTotal)}</p>
              </div>
            </div>
            {loading ? (
              <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">Loading sales data…</div>
            ) : loadError ? (
              <div className="flex h-[340px] items-center justify-center text-sm text-destructive">{loadError}</div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={monthlySales} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tickLine={false} axisLine={false} width={72} />
                  <Tooltip formatter={(value) => [currency(Number(value) || 0), 'Sales']} />
                  <Bar dataKey="total" name="Sales" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
