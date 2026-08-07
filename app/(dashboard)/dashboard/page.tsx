'use client'

import { AlertCircle, CheckCircle2, Clock3, DollarSign, Eye, Truck, Users, Wrench } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { StatCard } from '@/components/dashboard/stat-card'
import { DateTimeCard } from '@/components/dashboard/date-time-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { ActivityList } from '@/components/dashboard/activity-list'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'

export default function DashboardPage() {
  const { payments, jobCards, customers, vehicles, mechanics, parts } = useGarageStore()

  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const activeJobs = jobCards.filter((job) => job.status !== 'completed').length
  const inProgressJobs = jobCards.filter((job) => job.status === 'in-progress').length
  const completedToday = jobCards.filter((job) => job.status === 'completed' && new Date(job.createdAt).toDateString() === new Date().toDateString()).length
  const lowStock = parts.filter((part) => part.quantity <= part.minStock).length
  const onDuty = mechanics.filter((mechanic) => mechanic.available).length

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-7 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Garage Operations</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">Overview of your garage operations and key metrics</p>
              </div>
              <Button variant="outline" className="w-fit gap-2 rounded-full px-4"><Eye className="size-4" />Overview</Button>
            </div>

            <DateTimeCard />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Revenue" value={`$${revenue.toLocaleString()}`} change={0} icon={<DollarSign className="size-5 text-primary" />} accent="blue" />
              <StatCard title="Active Jobs" value={activeJobs} change={0} icon={<Wrench className="size-5 text-primary" />} accent="blue" />
              <StatCard title="In Progress" value={inProgressJobs} change={0} icon={<Clock3 className="size-5 text-blue-500" />} accent="amber" />
              <StatCard title="Completed Today" value={completedToday} change={0} icon={<CheckCircle2 className="size-5 text-green-500" />} accent="green" />
              <StatCard title="Total Customers" value={customers.length} change={0} icon={<Users className="size-5 text-primary" />} accent="blue" />
              <StatCard title="Total Vehicles" value={vehicles.length} change={0} icon={<Truck className="size-5 text-primary" />} accent="blue" />
              <StatCard title="Mechanics Available" value={onDuty} change={0} icon={<Wrench className="size-5 text-green-500" />} accent="green" />
              <StatCard title="Low Stock Items" value={lowStock} change={0} icon={<AlertCircle className="size-5 text-destructive" />} trend="down" accent="red" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityList />
              <RevenueChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
