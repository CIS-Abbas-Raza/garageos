'use client'

import { useEffect, useState } from 'react'
import { CarFront, Pencil, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useBranch } from '@/lib/branch-context'

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
  const { selectedCompany } = useBranch()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [taskStatus, setTaskStatus] = useState('pending')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadAssignments = async () => {
      if (!selectedCompany) {
        setAssignments([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/backend-api/task-assignments?company_id=${encodeURIComponent(selectedCompany)}`)
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
  }, [selectedCompany])

  const openStatusModal = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setTaskStatus(assignment.task?.task_status ?? 'pending')
  }

  const saveStatus = async () => {
    if (!editingAssignment) return
    setIsSaving(true)
    try {
      const response = await fetch(`/backend-api/task-assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_status: taskStatus }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to update task status.')
      setAssignments((current) => current.map((assignment) =>
        assignment.id === editingAssignment.id
          ? { ...assignment, task: { ...assignment.task, task_status: taskStatus } }
          : assignment,
      ))
      toast.success('Task status updated.')
      setEditingAssignment(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update task status.')
    } finally {
      setIsSaving(false)
    }
  }

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
                  <th className="px-5 py-4 font-semibold">Vehicle Name</th>
                  <th className="px-5 py-4 font-semibold">License Plate</th>
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
                          <CarFront className="size-4 text-primary" />
                          <span>{assignment.task?.taskCard?.quotation?.vehicle?.name ?? 'â€”'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{assignment.task?.taskCard?.quotation?.vehicle?.license_plate ?? 'â€”'}</td>
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
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => openStatusModal(assignment)}>
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

      <Dialog open={Boolean(editingAssignment)} onOpenChange={(open) => !open && setEditingAssignment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>Update the progress for this assigned task.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p>
              <span className="font-medium text-foreground">Service:</span>{' '}
              {editingAssignment?.task?.type === 'parts' ? 'Parts' : 'Service'}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">Description:</span>{' '}
              {editingAssignment?.task?.description || '—'}
            </p>
          </div>
          <div className="space-y-2 py-2">
            <Label htmlFor="assigned-task-status">Task Status</Label>
            <Select value={taskStatus} onValueChange={setTaskStatus}>
              <SelectTrigger id="assigned-task-status" className="w-full"><SelectValue placeholder="Select task status" /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>Cancel</Button>
            <Button type="button" onClick={saveStatus} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Status'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
