'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Pencil, FileText, User, CarFront, MoreHorizontal, Trash2, Receipt, Image, Search, Star } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useBranch } from '@/lib/branch-context'
import { CustomerReviewDialog } from '@/components/task-cards/customer-review-dialog'
import { useAuth } from '@/lib/auth-context'
import { getDashboardRole } from '@/lib/role-access'

export default function TaskCardsListingPage() {
  const router = useRouter()
  const { customers, vehicles } = useGarageStore()
  const { selectedCompany } = useBranch()
  const { user, isSuperAdmin } = useAuth()
  const canManageTaskCards = getDashboardRole(user, isSuperAdmin) !== 'customer'
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [quotationId, setQuotationId] = useState<string | undefined>()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewTarget, setReviewTarget] = useState<Record<string, any> | null>(null)

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
      const vehicleName = card.quotation?.vehicle?.name ||
        [card.quotation?.vehicle?.make, card.quotation?.vehicle?.model].filter(Boolean).join(' ') ||
        getVehicleName(card.vehicleId)
      const matchesSearch = !normalizedQuery || [
        card.task_cards_number,
        card.taskCardNumber,
        card.title,
        customerName,
        vehicleName,
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
        {canManageTaskCards && <Button onClick={() => router.push(taskCardPath('create'))} className="w-full gap-2 sm:w-auto">
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

      {rows.length === 0 ? (
        <EmptyState
          title="No task cards yet"
          description="Create your first task card to start assigning service and parts tasks."
          action={canManageTaskCards ? {
            label: 'Add Task Card',
            onClick: () => router.push(taskCardPath('create')),
          } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Task Card #</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Vehicle</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
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
                          {card.quotation?.vehicle?.name ??
                            ([card.quotation?.vehicle?.make, card.quotation?.vehicle?.model].filter(Boolean).join(' ') ||
                              getVehicleName(card.vehicleId))}
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
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString()}
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
                            {canManageTaskCards && <DropdownMenuItem
                              onClick={() => router.push(taskCardPath('edit', card.id))}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>}
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices?task_id=${encodeURIComponent(String(card.id))}`)}
                              className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              <Receipt className="size-4 text-emerald-600" />
                              Invoice
                            </DropdownMenuItem>
                            {canManageTaskCards && <DropdownMenuItem
                              onClick={() => router.push(`/task-cards/${card.id}/vehicle-pictures`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Image className="size-4 text-primary" />
                              Vehicle Pictures
                            </DropdownMenuItem>}
                            <DropdownMenuItem
                              onClick={() => setReviewTarget(card)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Star className="size-4 text-amber-500" />
                              Customer Review
                            </DropdownMenuItem>
                            {canManageTaskCards && <DropdownMenuItem
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
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No task cards match your filters.</td></tr>
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
