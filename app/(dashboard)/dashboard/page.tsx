'use client'

import { AlertCircle, CheckCircle2, Clock3, DollarSign, Eye, Truck, Users, Wrench, ClipboardList, FileText, CreditCard, Calendar } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { DateTimeCard } from '@/components/dashboard/date-time-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import TasksDoughnut from '@/components/dashboard/tasks-doughnut'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { payments, jobCards, customers, vehicles, mechanics, parts, invoices, estimations, appointments, employees, currentCompanyId } = useGarageStore()

  const [apiStats, setApiStats] = useState<any | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const revenue = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)
  const activeJobs = jobCards.filter((job) => job.status !== 'completed').length
  const inProgressJobs = jobCards.filter((job) => job.status === 'in-progress').length
  const completedToday = jobCards.filter((job) => job.status === 'completed' && new Date(job.createdAt).toDateString() === new Date().toDateString()).length
  const lowStock = parts.filter((part) => part.quantity <= part.minStock).length
  const onDuty = mechanics.filter((mechanic) => mechanic.available).length

  const pendingInvoices = (invoices ?? []).filter((i) => ['pending', 'partially-paid', 'overdue'].includes(i.status)).length
  const pendingQuotations = (estimations ?? []).filter((q) => ['sent', 'draft'].includes(q.status)).length
  const pendingPayments = (payments ?? []).filter((p) => p.paymentStatus === 'pending' || p.paymentStatus === 'not_verified').length

  const totalEmployees = (employees ?? []).length
  const totalAppointments = (appointments ?? []).length

  const totalTasks = jobCards.length
  const totalPendingTasks = jobCards.filter((j) => j.status === 'pending').length
  const totalCompletedTasks = jobCards.filter((j) => j.status === 'completed').length
  const totalInProgressTasks = jobCards.filter((j) => j.status === 'in-progress').length

  useEffect(() => {
    const cid = currentCompanyId
    if (!cid) return
    // Normalize mock store company ids like 'c1' -> numeric 1 for backend API
    let companyParam: string | number = cid
    if (typeof cid === 'string') {
      const m = cid.match(/^c(\d+)$/i)
      if (m) companyParam = Number(m[1])
    }
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true)
        const res = await fetch(`/backend-api/dashboard/stats?company_id=${encodeURIComponent(String(companyParam))}`)
        const body = await res.json().catch(() => ({}))
        if (res.ok && body.success !== false) {
          setApiStats(body.data ?? body)
        } else {
          setApiStats(null)
        }
      } catch (e) {
        setApiStats(null)
      } finally {
        setIsLoadingStats(false)
      }
    }

    void fetchStats()
  }, [currentCompanyId])

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-7 p-5 sm:p-7 lg:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Garage Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Home Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Overview of your garage operations and key metrics</p>
        </div>
        {/* <Button variant="outline" className="w-fit gap-2 rounded-full px-4"><Eye className="size-4" />Overview</Button> */}
      </div>

      <DateTimeCard />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${(apiStats?.totalRevenue ?? revenue).toLocaleString?.() ?? (apiStats?.totalRevenue ?? revenue)}`} change={0} icon={<DollarSign className="size-5 text-primary" />} accent="blue" />
        <StatCard title="Pending Invoices" value={apiStats?.totalPendingInvoices ?? pendingInvoices} change={0} icon={<FileText className="size-5 text-primary" />} accent="amber" />
        <StatCard title="Pending Quotations" value={apiStats?.totalPendingQuotations ?? pendingQuotations} change={0} icon={<ClipboardList className="size-5 text-primary" />} accent="amber" />
        <StatCard title="Pending Payments" value={apiStats?.totalPendingPayments ?? pendingPayments} change={0} icon={<CreditCard className="size-5 text-primary" />} accent="amber" />

        <StatCard title="Total Employees" value={apiStats?.totalEmployees ?? totalEmployees} change={0} icon={<Users className="size-5 text-primary" />} accent="blue" />
        <StatCard title="Total Customers" value={apiStats?.totalCustomers ?? customers.length} change={0} icon={<Users className="size-5 text-primary" />} accent="blue" />
        <StatCard title="Total Vehicles" value={apiStats?.totalVehicles ?? vehicles.length} change={0} icon={<Truck className="size-5 text-primary" />} accent="blue" />
        <StatCard title="Total Appointments" value={apiStats?.totalAppointments ?? totalAppointments} change={0} icon={<Calendar className="size-5 text-primary" />} accent="blue" />

        <StatCard title="Total Tasks" value={apiStats?.totalTasks ?? totalTasks} change={0} icon={<Wrench className="size-5 text-primary" />} accent="blue" />
        <StatCard title="Pending Tasks" value={apiStats?.totalPendingTasks ?? totalPendingTasks} change={0} icon={<Clock3 className="size-5 text-amber-500" />} accent="amber" />
        <StatCard title="Completed Tasks" value={apiStats?.totalCompletedTasks ?? totalCompletedTasks} change={0} icon={<CheckCircle2 className="size-5 text-green-500" />} accent="green" />
        <StatCard title="In Progress Tasks" value={apiStats?.totalInProgressTasks ?? totalInProgressTasks} change={0} icon={<Clock3 className="size-5 text-blue-500" />} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasksDoughnut />
        <RevenueChart />
      </div>
    </div>
  )
}
