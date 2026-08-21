'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CarFront, Calendar, Download, FileText, Pencil, Plus, User, MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { generateInvoicePdf, type InvoicePdfPayload } from '@/components/invoices/invoice-form-page'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGarageStore } from '@/lib/store/garage-store'
import { cn } from '@/lib/utils'

export default function InvoicesPage() {
  const router = useRouter()
  const { customers, vehicles } = useGarageStore()
  const [invoices, setInvoices] = useState<Record<string, any>[]>([])
  const [taskId, setTaskId] = useState<string | undefined>()

  useEffect(() => {
    setTaskId(new URLSearchParams(window.location.search).get('task_id') ?? undefined)
  }, [])

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const query = taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''
        const response = await fetch(`/backend-api/invoices${query}`)
        const result = await response.json()
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load invoices.')
        setInvoices(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load invoices.')
      }
    }
    void loadInvoices()
  }, [taskId])

  const rows = useMemo(
    () =>
      invoices
        .slice()
        .sort((a, b) => {
          const left = new Date(b.createdAt ?? b.creation_date).getTime()
          const right = new Date(a.createdAt ?? a.creation_date).getTime()
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

  const downloadInvoice = async (invoiceId: string | number) => {
    try {
      const invoiceResponse = await fetch(`/backend-api/invoices/${invoiceId}`)
      const invoiceResult = await invoiceResponse.json()
      if (!invoiceResponse.ok || invoiceResult.success === false || !invoiceResult.data) {
        throw new Error(invoiceResult.message || 'Unable to load invoice for download.')
      }

      const invoice = invoiceResult.data
      const companyResponse = await fetch(`/backend-api/companies/${invoice.company_id}`)
      const companyResult = await companyResponse.json()
      if (!companyResponse.ok || companyResult.success === false || !companyResult.data) {
        throw new Error(companyResult.message || 'Unable to load invoice company.')
      }

      const company = companyResult.data
      const vehicle = invoice.taskCard?.quotation?.vehicle ?? {}
      const customer = vehicle.customer ?? {}
      const customerName = customer.name ?? ([customer.first_name ?? customer.firstName, customer.last_name ?? customer.lastName].filter(Boolean).join(' ') || '—')
      const companyAddress = [company.address, company.city, company.state, company.zip_code ?? company.zipCode].filter(Boolean).join(', ') || '—'
      const subtotal = Number(invoice.subtotal ?? 0)
      const discountAmount = Number(invoice.discount ?? 0)
      const payload: InvoicePdfPayload = {
        companyName: company.name ?? 'Company',
        companyEmail: company.email ?? '—',
        companyCountry: company.country ?? '—',
        companyPhone: company.phone ?? '—',
        companyAddress,
        companyRegNo: company.registration_no ?? company.registrationNo ?? '—',
        companyLogoUrl: company.logo_url ?? company.logoUrl ?? company.logo,
        invoiceNumber: invoice.invoice_number ?? `INV-${invoice.id}`,
        creationDate: invoice.creation_date ?? '',
        dueDate: invoice.due_date ?? invoice.dueDate ?? invoice.creation_date ?? '',
        paymentStatus: invoice.payment_status ?? 'pending',
        customerName,
        customerEmail: customer.email ?? '—',
        customerPhone: customer.phone ?? '—',
        customerAddress: customer.address ?? '—',
        vehicleName: vehicle.name ?? ([vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'),
        vehicleMake: vehicle.make ?? '—',
        vehicleModel: vehicle.model ?? '—',
        vehicleVariant: vehicle.variant ?? '—',
        vehicleYear: vehicle.year ? String(vehicle.year) : '—',
        vin: vehicle.vin ?? vehicle.VIN ?? '—',
        licensePlate: vehicle.license_plate ?? vehicle.licensePlate ?? '—',
        notes: invoice.notes ?? '',
        includeLineItems: (invoice.details ?? []).length > 0,
        lineItems: (invoice.details ?? []).map((detail: any) => ({
          type: detail.type,
          description: detail.description ?? '',
          qty: Number(detail.qty ?? 0),
          unitPrice: Number(detail.unit_price ?? 0),
        })),
        subtotal,
        taxPercentage: Number(invoice.tax_percentage ?? 0),
        taxAmount: Number(invoice.tax_amount ?? 0),
        discountPercentage: subtotal > 0 ? Number(((discountAmount / subtotal) * 100).toFixed(2)) : 0,
        discountAmount,
        total: Number(invoice.total ?? 0),
      }

      await generateInvoicePdf(payload)
      toast.success('Invoice PDF downloaded.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download invoice.')
    }
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
        <Button onClick={() => router.push(`/invoices/create${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`)} className="w-full gap-2 sm:w-auto">
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
            onClick: () => router.push(`/invoices/create${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`),
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
                        <span>{invoice.invoice_number ?? invoice.invoiceNumber ?? invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{invoice.taskCard?.quotation?.vehicle?.customer?.name ?? getCustomerName(invoice.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>{invoice.taskCard?.quotation?.vehicle?.name ?? getVehicleName(invoice.vehicleId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          (invoice.invoice_status ?? invoice.status) === 'approved' && 'bg-emerald-500/10 text-emerald-700',
                          (invoice.invoice_status ?? invoice.status) === 'pending' && 'bg-amber-500/10 text-amber-700',
                          (invoice.invoice_status ?? invoice.status) === 'draft' && 'bg-slate-500/10 text-slate-700',
                        )}
                      >
                        {invoice.invoice_status ?? invoice.status ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          (invoice.payment_status ?? invoice.paymentStatus) === 'completed' && 'bg-emerald-500/10 text-emerald-700',
                          (invoice.payment_status ?? invoice.paymentStatus) === 'pending' && 'bg-amber-500/10 text-amber-700',
                        )}
                      >
                        {invoice.payment_status ?? invoice.paymentStatus ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${Number(invoice.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{new Date(invoice.createdAt ?? invoice.creation_date).toLocaleDateString()}</span>
                      </div>
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
                              onClick={() => router.push(`/invoices/edit/${invoice.id}${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => void downloadInvoice(invoice.id)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Download className="size-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this invoice?')) {
                                  try {
                                    const response = await fetch(`/backend-api/invoices/${invoice.id}`, { method: 'DELETE' })
                                    const result = await response.json().catch(() => ({}))
                                    if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to delete invoice.')
                                    setInvoices((current) => current.filter((item) => item.id !== invoice.id))
                                    toast.success('Invoice deleted successfully')
                                  } catch (error) {
                                    toast.error(error instanceof Error ? error.message : 'Unable to delete invoice.')
                                  }
                                }
                              }}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive text-xs"
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
