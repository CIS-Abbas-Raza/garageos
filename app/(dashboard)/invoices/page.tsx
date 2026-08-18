'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CarFront, Calendar, FileText, Pencil, Plus, User } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'
import { cn } from '@/lib/utils'

export default function InvoicesPage() {
  const router = useRouter()
  const { invoices, customers, vehicles } = useGarageStore()

  const rows = useMemo(
    () =>
      invoices
        .slice()
        .sort((a, b) => {
          const left = new Date(b.createdAt).getTime()
          const right = new Date(a.createdAt).getTime()
          return left - right
        }),
    [invoices],
  )

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—' : '—'
  }

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return '—'
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ') || '—' : '—'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Garage Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create, review, and edit invoices using the full-page workflow.
          </p>
        </div>
        <Button onClick={() => router.push('/invoices/create')} className="w-full gap-2 sm:w-auto">
          <Plus className="size-4" />
          Add Invoice
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to start tracking billing and payments."
          action={{
            label: 'Add Invoice',
            onClick: () => router.push('/invoices/create'),
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Invoice #</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Vehicle</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((invoice) => (
                  <tr key={invoice.id} className="bg-background transition-colors hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span>{invoice.invoiceNumber ?? invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{getCustomerName(invoice.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>{getVehicleName(invoice.vehicleId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          invoice.status === 'approved' && 'bg-emerald-500/10 text-emerald-700',
                          invoice.status === 'pending' && 'bg-amber-500/10 text-amber-700',
                          invoice.status === 'draft' && 'bg-slate-500/10 text-slate-700',
                          invoice.status === 'paid' && 'bg-blue-500/10 text-blue-700',
                        )}
                      >
                        {invoice.status ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          invoice.paymentStatus === 'completed' && 'bg-emerald-500/10 text-emerald-700',
                          invoice.paymentStatus === 'pending' && 'bg-amber-500/10 text-amber-700',
                        )}
                      >
                        {invoice.paymentStatus ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${Number(invoice.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/invoices/edit/${invoice.id}`)}>
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
