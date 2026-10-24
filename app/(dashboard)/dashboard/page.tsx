'use client'

import { AlertCircle, CheckCircle2, Clock3, DollarSign, Eye, Truck, Users, Wrench, ClipboardList, FileText, CreditCard, Calendar } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { DateTimeCard } from '@/components/dashboard/date-time-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import TasksDoughnut from '@/components/dashboard/tasks-doughnut'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'
import { useBranch } from '@/lib/branch-context'
import { useEffect, useState } from 'react'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { DateRangeFilter, type DateRangeValue } from '@/components/common/date-range-filter'
import { useRolePermissions } from '@/lib/hooks/use-role-permissions'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { payments, jobCards, customers, vehicles, mechanics, parts, invoices, estimations, appointments, employees } = useGarageStore()
  const { selectedCompany } = useBranch()
  const { user } = useAuth()
  const { canSubModule } = useRolePermissions()
  const canViewSales = canSubModule('Sales', 'view')
  const canViewCompanyEmployees = canSubModule('Company Employees', 'view')
  const canViewCustomers = canSubModule('Customers', 'view')
  const canViewAppointments = canSubModule('Appointments', 'view')
  const canViewInvoices = canSubModule('All Invoices', 'view') || canSubModule('Invoice', 'view')
  const canViewTaskCards = canSubModule('Task Cards', 'view') || canSubModule('Assigned Tasks', 'view')
  const canViewQuotations = canSubModule('Quotations', 'view') || canSubModule('Quotation', 'view')
  const canViewVehicles = canSubModule('Vehicles', 'view') || canSubModule('All Vehicles', 'view')

  const [apiStats, setApiStats] = useState<any | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [dateRange, setDateRange] = useState<DateRangeValue>({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const start = params.get('startDate')
    const end = params.get('endDate')
    if (start && end) setDateRange({ startDate: new Date(`${start}T00:00:00`), endDate: new Date(`${end}T23:59:59.999`) })
  }, [])

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
    if (!selectedCompany) return
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true)
        const params = new URLSearchParams({ company_id: selectedCompany, startDate: format(dateRange.startDate, 'yyyy-MM-dd'), endDate: format(dateRange.endDate, 'yyyy-MM-dd') })
        if (user?.roleName?.trim().toLowerCase() === 'customer' && user.id) {
          params.set('customer_id', user.id)
        }
        const res = await fetch(`/backend-api/dashboard/stats?${params.toString()}`)
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
  }, [selectedCompany, dateRange, user?.id, user?.roleName])

  const handleDateRangeChange = (range: DateRangeValue | null) => {
    const next = range ?? { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }
    setDateRange(next)
    const params = new URLSearchParams(window.location.search)
    params.set('startDate', format(next.startDate, 'yyyy-MM-dd'))
    params.set('endDate', format(next.endDate, 'yyyy-MM-dd'))
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-7 p-5 sm:p-7 lg:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Garage Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Home Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Overview of your garage operations and key metrics</p>
          <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
        </div>
        {/* <Button variant="outline" className="w-fit gap-2 rounded-full px-4"><Eye className="size-4" />Overview</Button> */}
      </div>

      <DateTimeCard />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canViewSales && <StatCard title="Total Revenue" value={`$${(apiStats?.totalRevenue ?? revenue).toLocaleString?.() ?? (apiStats?.totalRevenue ?? revenue)}`} change={0} icon={<DollarSign className="size-5 text-primary" />} accent="blue" />}
        {canViewInvoices && <StatCard title="Pending Invoices" value={apiStats?.totalPendingInvoices ?? pendingInvoices} change={0} icon={<FileText className="size-5 text-primary" />} accent="amber" />}
        {canViewQuotations && <StatCard title="Pending Quotations" value={apiStats?.totalPendingQuotations ?? pendingQuotations} change={0} icon={<ClipboardList className="size-5 text-primary" />} accent="amber" />}
        {canViewInvoices && <StatCard title="Pending Payments" value={apiStats?.totalPendingPayments ?? pendingPayments} change={0} icon={<CreditCard className="size-5 text-primary" />} accent="amber" />}

        {canViewCompanyEmployees && <StatCard title="Total Employees" value={apiStats?.totalEmployees ?? totalEmployees} change={0} icon={<Users className="size-5 text-primary" />} accent="blue" />}
        {canViewCustomers && <StatCard title="Total Customers" value={apiStats?.totalCustomers ?? customers.length} change={0} icon={<Users className="size-5 text-primary" />} accent="blue" />}
        {canViewVehicles && <StatCard title="Total Vehicles" value={apiStats?.totalVehicles ?? vehicles.length} change={0} icon={<Truck className="size-5 text-primary" />} accent="blue" />}
        {canViewAppointments && <StatCard title="Total Appointments" value={apiStats?.totalAppointments ?? totalAppointments} change={0} icon={<Calendar className="size-5 text-primary" />} accent="blue" />}

        {canViewTaskCards && <StatCard title="Total Tasks" value={apiStats?.totalTasks ?? totalTasks} change={0} icon={<Wrench className="size-5 text-primary" />} accent="blue" />}
        {canViewTaskCards && <StatCard title="Pending Tasks" value={apiStats?.totalPendingTasks ?? totalPendingTasks} change={0} icon={<Clock3 className="size-5 text-amber-500" />} accent="amber" />}
        {canViewTaskCards && <StatCard title="Completed Tasks" value={apiStats?.totalCompletedTasks ?? totalCompletedTasks} change={0} icon={<CheckCircle2 className="size-5 text-green-500" />} accent="green" />}
        {canViewTaskCards && <StatCard title="In Progress Tasks" value={apiStats?.totalInProgressTasks ?? totalInProgressTasks} change={0} icon={<Clock3 className="size-5 text-blue-500" />} accent="amber" />}
      </div>

      <div className={`grid gap-6 ${canViewSales && canViewTaskCards ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {canViewTaskCards && <TasksDoughnut dateRange={dateRange} />}
        {canViewSales && <RevenueChart />}
      </div>
    </div>
  )
}
