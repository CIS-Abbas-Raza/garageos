'use client'

import { useEffect, useMemo, useState } from 'react'
import { CarFront, Search } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

type TaskRow = Record<string, any>

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

export function ViewTasksPage() {
  const searchParams = useSearchParams()
  const taskCardId = searchParams.get('task_id')
  const [taskCard, setTaskCard] = useState<TaskRow | null>(null)
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    const loadTasks = async () => {
      if (!taskCardId) {
        setTaskCard(null)
        setTasks([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/backend-api/task-cards/${encodeURIComponent(taskCardId)}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load tasks for this Task Card.')
        }
        if (!cancelled) {
          setTaskCard(result.data)
          setTasks(Array.isArray(result.data.tasks) ? result.data.tasks : [])
        }
      } catch (error) {
        if (!cancelled) {
          setTaskCard(null)
          setTasks([])
          toast.error(error instanceof Error ? error.message : 'Unable to load tasks.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadTasks()
    return () => { cancelled = true }
  }, [taskCardId])

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return tasks.filter((task) => {
      const status = task.task_status ?? 'pending'
      const assignee = task.assignments?.[0]?.user?.name ?? task.assignments?.[0]?.user?.email ?? ''
      const values = [taskCard?.quotation?.vehicle?.make, taskCard?.quotation?.vehicle?.VIN, taskCard?.task_cards_number, task.id, task.description, assignee]
      const matchesQuery = !query || values.some((value) => String(value ?? '').toLowerCase().includes(query))
      return matchesQuery && (statusFilter === 'all' || status === statusFilter)
    })
  }, [tasks, taskCard, searchQuery, statusFilter])

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">Loading tasks...</div>
  }

  const vehicle = taskCard?.quotation?.vehicle ?? {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Garage Operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tasks for Task Card {taskCard?.task_cards_number ?? `#${taskCardId ?? ''}`}.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tasks..." className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none">
          <option value="all">All Status</option>
          {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {!taskCard ? <EmptyState title="Task Card not found" description="We could not find the Task Card for this task list." />
        : tasks.length === 0 ? <EmptyState title="No tasks" description="This Task Card does not have any tasks yet." />
          : <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-5 py-4 font-semibold">Make</th><th className="px-5 py-4 font-semibold">VIN</th><th className="px-5 py-4 font-semibold">Task Card #</th><th className="px-5 py-4 font-semibold">Assigned To</th><th className="px-5 py-4 font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.map((task) => {
                    const status = task.task_status ?? 'pending'
                    const assignments = task.assignments ?? []
                    const assigneeNames = assignments.map((assignment: TaskRow) => assignment.user?.name ?? assignment.user?.email ?? `User #${assignment.user_id}`).join(', ')
                    return <tr key={task.id} className="bg-background transition-colors hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium text-foreground"><div className="flex items-center gap-2"><CarFront className="size-4 text-primary" /><span>{vehicle.make ?? '—'}</span></div></td>
                      <td className="px-5 py-4 text-muted-foreground">{vehicle.vin ?? vehicle.VIN ?? '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{taskCard.task_cards_number ?? taskCard.id ?? '—'}</td>
                      <td className="px-5 py-4 text-foreground">{assigneeNames || '—'}</td>
                      <td className="px-5 py-4"><span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusClass[status] ?? statusClass.pending)}>{statusLabel[status] ?? status}</span></td>
                    </tr>
                  })}
                  {tasks.length > 0 && filteredTasks.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No tasks match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>}
    </div>
  )
}
