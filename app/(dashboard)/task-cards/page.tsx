'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, FileText, User, CarFront, MoreHorizontal, Trash2, Receipt, Image } from 'lucide-react'
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

export default function TaskCardsListingPage() {
  const router = useRouter()
  const { jobCards, customers, vehicles, deleteJobCard } = useGarageStore()

  const rows = useMemo(
    () =>
      jobCards
        .slice()
        .sort((a, b) => {
          const left = new Date(b.createdAt).getTime()
          const right = new Date(a.createdAt).getTime()
          return left - right
        }),
    [jobCards],
  )

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName} ${customer.lastName}` : '—'
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model}` : '—'
  }

  const handleDelete = (id: string, title?: string) => {
    deleteJobCard(id)
    toast.success(`Task card ${title || id} deleted.`)
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
        <Button onClick={() => router.push('/task-cards/create')} className="w-full gap-2 sm:w-auto">
          <Plus className="size-4" />
          Add Task Card
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No task cards yet"
          description="Create your first task card to start assigning service and parts tasks."
          action={{
            label: 'Add Task Card',
            onClick: () => router.push('/task-cards/create'),
          }}
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
                  <th className="px-5 py-4 font-semibold">Priority</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((card) => (
                  <tr key={card.id} className="bg-background transition-colors hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span>{(card as any).taskCardNumber || card.title || card.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{getCustomerName(card.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>{getVehicleName(card.vehicleId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          card.status === 'completed' && 'bg-emerald-500/10 text-emerald-700',
                          card.status === 'pending' && 'bg-amber-500/10 text-amber-700',
                          card.status === 'in-progress' && 'bg-blue-500/10 text-blue-700',
                          card.status === 'on-hold' && 'bg-slate-500/10 text-slate-700',
                        )}
                      >
                        {card.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 capitalize text-foreground font-medium">
                      {card.priority}
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
                            <DropdownMenuItem
                              onClick={() => router.push(`/task-cards/edit/${card.id}`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push('/invoices')}
                              className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              <Receipt className="size-4 text-emerald-600" />
                              Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/task-cards/${card.id}/vehicle-pictures`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Image className="size-4 text-primary" />
                              Vehicle Pictures
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(card.id, (card as any).taskCardNumber || card.title)}
                              className="gap-2 cursor-pointer text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
