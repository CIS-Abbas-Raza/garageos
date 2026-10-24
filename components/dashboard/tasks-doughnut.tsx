"use client"

import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useGarageStore } from '@/lib/store/garage-store'
import { useBranch } from '@/lib/branch-context'
import type { DateRangeValue } from '@/components/common/date-range-filter'
import { format } from 'date-fns'
import { useAuth } from '@/lib/auth-context'

const COLORS = ['#f59e0b', '#2563eb', '#16a34a'] // Pending (amber), In Progress (blue), Completed (green)

export function TasksDoughnut({ dateRange }: { dateRange?: DateRangeValue }) {
  const { jobCards } = useGarageStore()
  const { selectedCompany } = useBranch()
  const { user } = useAuth()
  const [apiData, setApiData] = useState<{ labels: string[]; values: number[] } | null>(null)

  useEffect(() => {
    if (!selectedCompany) return

    const fetchDoughnut = async () => {
      try {
        const params = new URLSearchParams({ company_id: selectedCompany })
        if (user?.roleName?.trim().toLowerCase() === 'customer' && user.id) {
          params.set('customer_id', user.id)
        }
        if (dateRange) {
          params.set('startDate', format(dateRange.startDate, 'yyyy-MM-dd'))
          params.set('endDate', format(dateRange.endDate, 'yyyy-MM-dd'))
        }
        const res = await fetch(`/backend-api/dashboard/tasks-doughnut?${params.toString()}`)
        const body = await res.json().catch(() => ({}))
        if (res.ok && body.success !== false) {
          setApiData(body.data?.doughnut ?? body.doughnut ?? null)
        } else {
          setApiData(null)
        }
      } catch (e) {
        setApiData(null)
      }
    }

    void fetchDoughnut()
  }, [selectedCompany, dateRange, user?.id, user?.roleName])

  const fallback = useMemo(() => {
    const totalPending = jobCards.filter((j) => j.status === 'pending').length
    const totalInProgress = jobCards.filter((j) => j.status === 'in-progress').length
    const totalCompleted = jobCards.filter((j) => j.status === 'completed').length
    return { labels: ['Pending', 'In Progress', 'Completed'], values: [totalPending, totalInProgress, totalCompleted] }
  }, [jobCards])

  const data = apiData ? apiData.labels.map((label, i) => ({ name: label, value: apiData.values[i] ?? 0 })) : fallback.labels.map((label, i) => ({ name: label, value: fallback.values[i] }))

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Tasks Report</h3>
        <p className="text-sm text-muted-foreground mt-1">Tasks status distribution</p>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TasksDoughnut
