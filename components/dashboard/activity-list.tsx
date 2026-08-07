'use client'

import { useGarageStore } from '@/lib/store/garage-store'
import { FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useMemo } from 'react'

export function ActivityList() {
  const { jobCards } = useGarageStore()

  const recentActivities = useMemo(() => {
    return jobCards
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((job) => {
        let icon = FileText
        let statusColor = 'text-muted-foreground'
        let statusLabel = 'Created'

        if (job.status === 'completed') {
          icon = CheckCircle2
          statusColor = 'text-green-500'
          statusLabel = 'Completed'
        } else if (job.status === 'in-progress') {
          icon = Clock
          statusColor = 'text-blue-500'
          statusLabel = 'In Progress'
        } else if (job.status === 'on-hold') {
          icon = AlertCircle
          statusColor = 'text-orange-500'
          statusLabel = 'On Hold'
        }

        return {
          id: job.id,
          title: `Job Card #${job.id.slice(0, 8)}`,
          status: statusLabel,
          statusColor,
          icon,
          time: new Date(job.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      })
  }, [jobCards])

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest job cards and updates</p>
      </div>
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${activity.statusColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.status}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  )
}
