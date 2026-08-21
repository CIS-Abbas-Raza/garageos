'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'Inprogress', label: 'In Progress' },
  { value: 'compeleted', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function AssignedTaskStatusForm({ assignmentId }: { assignmentId: string }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<Record<string, any>>()
  const [taskStatus, setTaskStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const response = await fetch(`/backend-api/task-assignments/${assignmentId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) throw new Error(result.message || 'Unable to load assigned task.')
        setAssignment(result.data)
        setTaskStatus(result.data.task?.task_status ?? 'pending')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load assigned task.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAssignment()
  }, [assignmentId])

  const saveStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!taskStatus) return

    setIsSaving(true)
    try {
      const response = await fetch(`/backend-api/task-assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_status: taskStatus }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to update task status.')
      toast.success('Task status updated.')
      router.push('/assigned-tasks')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update task status.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground sm:px-6">Loading assigned task...</div>

  if (!assignment) {
    return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><EmptyState title="Assigned task not found" description="This assignment may have been removed." action={{ label: 'Back to Assigned Tasks', onClick: () => router.push('/assigned-tasks') }} /></div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <Button type="button" variant="ghost" className="mb-3 -ml-3 gap-2" onClick={() => router.push('/assigned-tasks')}>
        <ArrowLeft className="size-4" /> Back to Assigned Tasks
      </Button>
      <div className="rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <p className="text-sm font-medium text-primary">Assigned Task</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Update Task Status</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only the task status can be changed here.</p>
        </div>
        <form onSubmit={saveStatus} className="space-y-6 px-5 py-6 sm:px-6">
          <div className="rounded-xl bg-muted/40 p-4 text-sm">
            <p><span className="font-semibold text-foreground">Task:</span> {assignment.task?.description || `Task #${assignment.task_id}`}</p>
            <p className="mt-2"><span className="font-semibold text-foreground">Assigned to:</span> {assignment.user?.name ?? assignment.user?.email ?? `User #${assignment.user_id}`}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-status">Task Status</Label>
            <Select value={taskStatus} onValueChange={(value) => setTaskStatus(value ?? '')}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue placeholder="Select task status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/assigned-tasks')}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !taskStatus}>{isSaving ? 'Saving...' : 'Save Status'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
