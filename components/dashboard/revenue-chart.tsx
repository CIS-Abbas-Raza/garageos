"use client"

import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { useGarageStore } from '@/lib/store/garage-store'

export function RevenueChart() {
  const { invoices, expenses, currentCompanyId } = useGarageStore()
  const [apiData, setApiData] = useState<{ labels: string[]; revenue: number[]; expenses: number[] } | null>(null)

  useEffect(() => {
    const cid = currentCompanyId
    if (!cid) return
    let companyParam: string | number = cid
    if (typeof cid === 'string') {
      const m = cid.match(/^c(\d+)$/i)
      if (m) companyParam = Number(m[1])
    }

    const fetchOverview = async () => {
      try {
        const res = await fetch(`/backend-api/dashboard/overview?company_id=${encodeURIComponent(String(companyParam))}`)
        const body = await res.json().catch(() => ({}))
        if (res.ok && body.success !== false) {
          setApiData(body.data ?? body)
        } else {
          setApiData(null)
        }
      } catch (e) {
        setApiData(null)
      }
    }

    void fetchOverview()
  }, [currentCompanyId])

  const revenueData = useMemo(() => {
    if (apiData) {
      return apiData.labels.map((label, idx) => {
        const d = new Date(label + '-01')
        const month = d.toLocaleString('en-US', { month: 'short' })
        return { month, revenue: apiData.revenue[idx] ?? 0, expenses: apiData.expenses[idx] ?? 0 }
      })
    }

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      const month = date.toLocaleString('en-US', { month: 'short' })
      const revenueValue = invoices
        .filter((invoice) => new Date(invoice.createdAt).getMonth() === date.getMonth())
        .reduce((sum, invoice) => sum + (invoice.amountPaid ?? 0), 0)
      const expenseValue = expenses
        .filter((expense) => new Date(expense.date).getMonth() === date.getMonth())
        .reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
      return { month, revenue: revenueValue, expenses: expenseValue }
    })
  }, [invoices, expenses, apiData])

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 6 months revenue vs expenses</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData} margin={{ left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))}
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#166534" name="Revenue" />
          <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
