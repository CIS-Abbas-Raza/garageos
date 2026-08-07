'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGarageStore } from '@/lib/store/garage-store'

export function RevenueChart() {
  const { invoices, expenses } = useGarageStore()

  const revenueData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      const month = date.toLocaleString('en-US', { month: 'short' })
      const revenueValue = invoices
        .filter((invoice) => new Date(invoice.createdAt).getMonth() === date.getMonth())
        .reduce((sum, invoice) => sum + invoice.amountPaid, 0)
      const expenseValue = expenses
        .filter((expense) => new Date(expense.date).getMonth() === date.getMonth())
        .reduce((sum, expense) => sum + expense.amount, 0)
      return { month, revenue: revenueValue, expenses: expenseValue }
    })
  }, [invoices, expenses])

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 6 months revenue vs expenses</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="revenue" fill="var(--chart-1)" name="Revenue" />
          <Bar dataKey="expenses" fill="var(--chart-2)" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
