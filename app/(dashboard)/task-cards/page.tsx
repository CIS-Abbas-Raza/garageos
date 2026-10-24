'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Pencil, FileText, User, CarFront, MoreHorizontal, Trash2, Receipt, Search, Star, Mail, ListChecks } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGarageStore } from '@/lib/store/garage-store'
import { cn, formatDisplayDate } from '@/lib/utils'
import { useBranch } from '@/lib/branch-context'
import { useRolePermissions } from '@/lib/hooks/use-role-permissions'
import { CustomerReviewDialog } from '@/components/task-cards/customer-review-dialog'
import { RecordCountBadges } from '@/components/common/record-count-badges'

export default function TaskCardsListingPage() {
  const router = useRouter()
  const { customers, vehicles } = useGarageStore()
  const { selectedCompany } = useBranch()
  const { canSubModule } = useRolePermissions()
  const canCreateTaskCard = canSubModule('Task Cards', 'create')
  const canUpdateTaskCard = canSubModule('Task Cards', 'update')
  const canDeleteTaskCard = canSubModule('Task Cards', 'delete')
  const canViewTasks = canSubModule('Task Cards', 'view')
  const canViewInvoices = canSubModule('Invoice', 'view')
  const canViewCustomerReviews = canSubModule('Customer Review', 'view')
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [quotationId, setQuotationId] = useState<string | undefined>()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewTarget, setReviewTarget] = useState<Record<string, any> | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<string | number | null>(null)

  useEffect(() => {
    setQuotationId(searchParams.get('quotation_id') ?? undefined)
  }, [searchParams])

  useEffect(() => {
    const loadTaskCards = async () => {
      try {
        // Only call backend listing when a quotation_id is present in the URL
        if (!quotationId) {
          setRows([])
          return
        }

        const query = `?quotation_id=${encodeURIComponent(quotationId)}`
        const response = await fetch(`/backend-api/task-cards${query}`)
        const result = await response.json()
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load task cards.')
        setRows(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load task cards.')
      }
    }
    void loadTaskCards()
  }, [quotationId])

  const taskCardPath = (path: 'create' | 'edit', id?: number | string) => {
    const base = path === 'create' ? '/task-cards/create' : `/task-cards/edit/${id}`
    return quotationId ? `${base}?quotation_id=${encodeURIComponent(quotationId)}` : base
  }

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return rows.filter((card) => {
      const customerName = card.quotation?.vehicle?.customer?.name ?? getCustomerName(card.customerId)
      const vehicleVin = card.quotation?.vehicle?.vin ?? card.quotation?.vehicle?.VIN ?? getVehicleVin(card.vehicleId)
      const matchesSearch = !normalizedQuery || [
        card.task_cards_number,
        card.taskCardNumber,
        card.title,
        customerName,
        vehicleVin,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))
      const status = String(card.status ?? 1)

      return matchesSearch && (statusFilter === 'all' || status === statusFilter)
    })
  }, [rows, searchQuery, statusFilter, customers, vehicles])

  function getCustomerName(customerId: string) {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName} ${customer.lastName}` : '—'
  }

  function getVehicleName(vehicleId: string) {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model}` : '—'
  }

  function getVehicleVin(vehicleId: string) {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? (vehicle.vin ?? vehicle.VIN ?? '—') : '—'
  }

  function getTaskCardProgress(card: Record<string, any>) {
    const tasks = Array.isArray(card.tasks) ? card.tasks : []
    if (!tasks.length) return 0
    const completedTasks = tasks.filter((task) => ['completed', 'compeleted'].includes(String(task.task_status ?? task.taskStatus ?? '').trim().toLowerCase())).length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const sendTaskCardEmail = async (card: Record<string, any>) => {
    if (getTaskCardProgress(card) < 100) return
    setSendingEmailId(card.id)
    try {
      const response = await fetch('/backend-api/send-email/car-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_card_id: card.id }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || result.error || 'Unable to send task card email.')
      toast.success(result.message || 'Car-ready email sent successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send task card email.')
    } finally {
      setSendingEmailId(null)
    }
  }

  const handleDelete = async (id: number, title?: string) => {
    try {
      const response = await fetch(`/backend-api/task-cards/${id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to delete task card.')
      setRows((current) => current.filter((card) => card.id !== id))
      toast.success(`Task card ${title || id} deleted.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete task card.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Garage Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Task Cards</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track and assign work orders from start through completion.
          </p>
        </div>
        {canCreateTaskCard && <Button onClick={() => router.push(taskCardPath('create'))} className="w-full gap-2 sm:w-auto">
          <Plus className="size-4" />
          Add Task Card
        </Button>}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search task cards..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      <div className="mb-5">
        <RecordCountBadges counts={[
          { label: 'Total', value: rows.length },
          { label: 'Active', value: rows.filter((card) => card.status === 1 || card.status === '1').length, color: 'green' },
          { label: 'Inactive', value: rows.filter((card) => card.status === 0 || card.status === '0').length, color: 'red' },
        ]} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No task cards yet"
          description="Create your first task card to start assigning service and parts tasks."
          action={canCreateTaskCard ? {
            label: 'Add Task Card',
            onClick: () => router.push(taskCardPath('create')),
          } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Task Card #</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">VIN</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Progress</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((card) => (
                  <tr key={card.id} className="bg-background transition-colors hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span>{(card as any).task_cards_number || (card as any).taskCardNumber || card.title || card.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{card.quotation?.vehicle?.customer?.name ?? getCustomerName(card.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>
                          {card.quotation?.vehicle?.vin ?? card.quotation?.vehicle?.VIN ?? getVehicleVin(card.vehicleId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          (card.status === 1 || card.status === '1') && 'bg-emerald-500/10 text-emerald-700',
                          (card.status === 0 || card.status === '0') && 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {card.status === 1 || card.status === '1' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{getTaskCardProgress(card)}%</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDisplayDate(card.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {canViewTasks && <DropdownMenuItem
                              onClick={() => router.push(`/view-tasks?task_id=${encodeURIComponent(String(card.id))}`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <ListChecks className="size-4" />
                              View Tasks
                            </DropdownMenuItem>}
                            {canUpdateTaskCard && <DropdownMenuItem
                              onClick={() => router.push(taskCardPath('edit', card.id))}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>}
                            {canUpdateTaskCard && <DropdownMenuItem
                              onClick={() => void sendTaskCardEmail(card)}
                              disabled={getTaskCardProgress(card) < 100 || sendingEmailId === card.id}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Mail className="size-4" />
                              {sendingEmailId === card.id ? 'Sending Email...' : 'Send Email'}
                            </DropdownMenuItem>}
                            {canViewInvoices && <DropdownMenuItem
                              onClick={() => router.push(`/invoices?task_id=${encodeURIComponent(String(card.id))}`)}
                              className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              <Receipt className="size-4 text-emerald-600" />
                              Invoice
                            </DropdownMenuItem>}
                            {canViewCustomerReviews && <DropdownMenuItem
                              onClick={() => setReviewTarget(card)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Star className="size-4 text-amber-500" />
                              Customer Review
                            </DropdownMenuItem>}
                            {canDeleteTaskCard && <DropdownMenuItem
                              onClick={() => handleDelete(card.id, (card as any).task_cards_number || (card as any).taskCardNumber || card.title)}
                              className="gap-2 cursor-pointer text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length > 0 && filteredRows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No task cards match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <CustomerReviewDialog
        taskCardId={reviewTarget?.id}
        companyId={selectedCompany ?? reviewTarget?.company_id}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      />
    </div>
  )
}
