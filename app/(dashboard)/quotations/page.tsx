'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, FileText, User, CarFront } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'
import { cn } from '@/lib/utils'

export default function QuotationsPage() {
  const router = useRouter()
  const { estimations, customers, vehicles } = useGarageStore()

  const rows = useMemo(
    () =>
      estimations
        .slice()
        .sort((a, b) => {
          const left = new Date(b.createdAt).getTime()
          const right = new Date(a.createdAt).getTime()
          return left - right
        }),
    [estimations],
  )

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName} ${customer.lastName}` : '—'
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model}` : '—'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Garage Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Quotations</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create, review, and edit quotations using the new full-page workflow.
          </p>
        </div>
        <Button onClick={() => router.push('/quotations/create')} className="w-full gap-2 sm:w-auto">
          <Plus className="size-4" />
          Add Quotation
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No quotations yet"
          description="Create your first quotation to start tracking estimates and approvals."
          action={{
            label: 'Add Quotation',
            onClick: () => router.push('/quotations/create'),
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Quotation #</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Vehicle</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((quotation) => (
                  <tr key={quotation.id} className="bg-background transition-colors hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span>{quotation.quotationNumber ?? quotation.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{getCustomerName(quotation.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>{getVehicleName(quotation.vehicleId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          (quotation.quotationStatus ?? quotation.status) === 'accepted' && 'bg-emerald-500/10 text-emerald-700',
                          (quotation.quotationStatus ?? quotation.status) === 'draft' && 'bg-slate-500/10 text-slate-700',
                          (quotation.quotationStatus ?? quotation.status) === 'sent' && 'bg-blue-500/10 text-blue-700',
                          (quotation.quotationStatus ?? quotation.status) === 'rejected' && 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {quotation.quotationStatus ?? quotation.status ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${Number(quotation.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/quotations/edit/${quotation.id}`)}>
                          <Pencil className="size-4" />
                          Edit
                        </Button>
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
