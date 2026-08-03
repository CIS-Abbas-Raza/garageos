'use client'

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Wrench,
  AlertCircle,
  Users,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { dashboardStats, monthlyRevenueData, jobStatusData } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="REVENUE (MTD)"
                value={`$${(dashboardStats.revenueMTD / 1000).toFixed(1)}k`}
                change={dashboardStats.revenueVsLastMonth}
                icon={<DollarSign className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="ACTIVE JOBS"
                value={dashboardStats.activeJobs}
                change={dashboardStats.activeJobsVsLastMonth}
                icon={<Wrench className="h-5 w-5 text-blue-500" />}
              />
              <StatCard
                title="PENDING JOBS"
                value={dashboardStats.pendingJobs}
                change={dashboardStats.pendingJobsVsLastMonth}
                icon={<Clock className="h-5 w-5 text-amber-500" />}
                trend={dashboardStats.pendingJobsVsLastMonth > 0 ? "down" : "up"}
              />
              <StatCard
                title="COMPLETED TODAY"
                value={dashboardStats.completedToday}
                change={dashboardStats.completedTodayVsLastMonth}
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="VEHICLES TODAY"
                value={dashboardStats.vehiclesToday}
                change={dashboardStats.vehiclesTodayVsLastMonth}
                icon={<Truck className="h-5 w-5 text-purple-500" />}
              />
              <StatCard
                title="CUSTOMERS"
                value={dashboardStats.totalCustomers}
                change={dashboardStats.totalCustomersVsLastMonth}
                icon={<Users className="h-5 w-5 text-cyan-500" />}
              />
              <StatCard
                title="MECHANICS ON DUTY"
                value={dashboardStats.mechanicsOnDuty}
                change={0}
                icon={<Wrench className="h-5 w-5 text-indigo-500" />}
              />
              <StatCard
                title="LOW STOCK ITEMS"
                value={dashboardStats.lowStockItems}
                change={0}
                icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                trend="down"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 p-6 space-y-6 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Monthly Revenue</h2>
                    <p className="text-sm text-muted-foreground">Revenue vs. operating expenses (YTD)</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">30d</Button>
                    <Button variant="outline" size="sm">6m</Button>
                    <Button variant="outline" size="sm">1y</Button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Job Status Pie Chart */}
              <div className="p-6 space-y-6 rounded-lg border border-border bg-card">
                <div>
                  <h2 className="text-lg font-semibold">Job Status</h2>
                  <p className="text-sm text-muted-foreground">Distribution across current cards</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jobStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  {jobStatusData.map((status) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: status.fill }}
                        />
                        <span>{status.name}</span>
                      </div>
                      <span className="font-semibold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity and Appointments */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upcoming Appointments */}
              <div className="p-6 space-y-4 rounded-lg border border-border bg-card">
                <h2 className="text-lg font-semibold">Today&apos;s Appointments</h2>
                <div className="space-y-3">
                  {[
                    { time: "09:00 AM", customer: "John Michael", service: "Oil Change", vehicle: "2022 Honda Civic" },
                    { time: "10:30 AM", customer: "Sarah Anderson", service: "Brake Inspection", vehicle: "2021 Toyota Camry" },
                    { time: "01:00 PM", customer: "Robert Martinez", service: "Engine Diagnostic", vehicle: "2019 Ford F-150" },
                  ].map((appt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <div className="font-medium text-sm">{appt.customer}</div>
                        <div className="text-xs text-muted-foreground">{appt.vehicle}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{appt.time}</div>
                        <div className="text-xs text-muted-foreground">{appt.service}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Activity */}
              <div className="p-6 space-y-4 rounded-lg border border-border bg-card">
                <h2 className="text-lg font-semibold">Team Activity</h2>
                <div className="space-y-3">
                  {[
                    { mechanic: "John Smith", action: "Completed Oil Change", time: "2 hours ago" },
                    { mechanic: "Sarah Johnson", action: "Started Brake Pads Replacement", time: "1 hour ago" },
                    { mechanic: "Mike Davis", action: "Flagged for Review", time: "30 minutes ago" },
                    { mechanic: "Lisa Rodriguez", action: "Completed Electrical Repair", time: "15 minutes ago" },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-border">
                      <div>
                        <div className="font-medium text-sm">{activity.mechanic}</div>
                        <div className="text-xs text-muted-foreground">{activity.action}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
