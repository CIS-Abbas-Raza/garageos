'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Pencil, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Assignment = Record<string, any>

const statusClass: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700',
  Inprogress: 'bg-blue-500/10 text-blue-700',
  compeleted: 'bg-emerald-500/10 text-emerald-700',
  cancelled: 'bg-destructive/10 text-destructive',
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  Inprogress: 'In Progress',
  compeleted: 'Completed',
  cancelled: 'Cancelled',
}

export function AssignedTasksPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await fetch('/backend-api/task-assignments')
        const result = await response.json()
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load assigned tasks.')
        setAssignments(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load assigned tasks.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAssignments()
  }, [])

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">Loading assigned tasks...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Garage Operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Assigned Tasks</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review tasks assigned to company users and update their progress.</p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState title="No assigned tasks" description="Tasks assigned to company users will appear here." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Task</th>
                  <th className="px-5 py-4 font-semibold">Task Card #</th>
                  <th className="px-5 py-4 font-semibold">Assigned To</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((assignment) => {
                  const taskStatus = assignment.task?.task_status ?? 'pending'
                  return (
                    <tr key={assignment.id} className="bg-background transition-colors hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="size-4 text-primary" />
                          <span>{assignment.task?.description || `Task #${assignment.task_id}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{assignment.task?.taskCard?.task_cards_number ?? assignment.task?.task_card_id ?? '—'}</td>
                      <td className="px-5 py-4 text-foreground">
                        <div className="flex items-center gap-2">
                          <UserRound className="size-4 text-muted-foreground" />
                          <span>{assignment.user?.name ?? assignment.user?.email ?? `User #${assignment.user_id}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusClass[taskStatus] ?? statusClass.pending)}>
                          {statusLabel[taskStatus] ?? taskStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/assigned-tasks/edit/${assignment.id}`)}>
                          <Pencil className="size-4" />
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
