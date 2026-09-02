'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { EmptyState } from '@/components/empty-state'
import { generateInvoicePdf, type InvoicePdfPayload } from '@/components/invoices/invoice-form-page'
import { CarFront, Calendar, Download, FileText, Pencil, Plus, User, MoreHorizontal, Search, Trash2, WalletCards, Mail, MessageCircle, Send } from 'lucide-react'
import { InvoicePaymentDialog } from '@/components/invoices/invoice-payment-dialog'
import { Button } from '@/components/ui/button'
import { SendCustomerMessageDialog, type CommunicationChannel } from '@/components/communications/send-customer-message-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGarageStore } from '@/lib/store/garage-store'
import { cn } from '@/lib/utils'
import { useBranch } from '@/lib/branch-context'
import { useAuth } from '@/lib/auth-context'
import { getDashboardRole } from '@/lib/role-access'

export default function InvoicesPage() {
  const router = useRouter()
  const { customers, vehicles } = useGarageStore()
  const { selectedCompany } = useBranch()
  const { user, isSuperAdmin } = useAuth()
  const role = getDashboardRole(user, isSuperAdmin)
  const canManageInvoices = !['finance', 'staff', 'customer'].includes(role)
  const [invoices, setInvoices] = useState<Record<string, any>[]>([])
  const [payingInvoice, setPayingInvoice] = useState<(typeof invoices)[number] | null>(null)
  const [activeChannels, setActiveChannels] = useState<CommunicationChannel[]>([])
  const [messageTarget, setMessageTarget] = useState<{ channel: CommunicationChannel; customerId?: string | number; companyId?: string | number } | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [taskId, setTaskId] = useState<string | undefined>()
  const searchParams = useSearchParams()

  useEffect(() => {
    setTaskId(searchParams.get('task_id') ?? undefined)
  }, [searchParams])

  const loadInvoices = useCallback(async () => {
    // Only fetch invoices when a `task_id` is provided in the URL
    if (!taskId) {
      setInvoices([])
      return
    }

    if (!selectedCompany) {
      setInvoices([])
      return
    }

    try {
      const queryParams = new URLSearchParams({ company_id: String(selectedCompany) })
      queryParams.set('task_id', taskId)
      const query = `?${queryParams.toString()}`
      const response = await fetch(`/backend-api/invoices${query}`)
      const result = await response.json()
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load invoices.')
      setInvoices(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load invoices.')
    }
  }, [selectedCompany, taskId])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  useEffect(() => {
    if (!selectedCompany) return setActiveChannels([])
    const loadChannels = async () => {
      const checks: [CommunicationChannel, string][] = [['sms', 'twilio-sms-settings'], ['email', 'sendgrid-settings'], ['whatsapp', 'twilio-whatsapp-settings']]
      const results = await Promise.all(checks.map(async ([channel, path]) => {
        try {
          const response = await fetch(`/backend-api/${path}?company_id=${encodeURIComponent(selectedCompany)}&status=1`)
          const body = await response.json()
          const settings = Array.isArray(body) ? body : body.data
          return Array.isArray(settings) && settings.length ? channel : null
        } catch { return null }
      }))
      setActiveChannels(results.filter((channel): channel is CommunicationChannel => Boolean(channel)))
    }
    void loadChannels()
  }, [selectedCompany])
  
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

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return rows.filter((invoice) => {
      const status = String(invoice.invoice_status ?? invoice.status ?? 'draft').toLowerCase()
      const customerName = invoice.taskCard?.quotation?.vehicle?.customer?.name ?? getCustomerName(invoice.customerId)
      const vehicleName = invoice.taskCard?.quotation?.vehicle?.name ?? getVehicleName(invoice.vehicleId)
      const matchesSearch = !normalizedQuery || [
        invoice.invoice_number,
        invoice.invoiceNumber,
        customerName,
        vehicleName,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))

      return matchesSearch && (statusFilter === 'all' || status === statusFilter)
    })
  }, [rows, searchQuery, statusFilter, customers, vehicles])

  function getCustomerName(customerId: string) {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—' : '—'
  }

  function getVehicleName(vehicleId?: string) {
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
        discountPercentage: Number(invoice.discount_percentage ?? 0),
        discountAmount,
        total: Number(invoice.total ?? 0),
      }

      await generateInvoicePdf(payload)
      toast.success('Invoice PDF downloaded.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download invoice.')
    }
  }

  const sendInvoiceEmail = async (invoiceId: string | number) => {
    try {
      setSendingEmailId(invoiceId)
      const response = await fetch('/backend-api/email/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || 'Unable to send invoice email.')
      }
      toast.success(result.message || 'Invoice email sent successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send invoice email.')
    } finally {
      setSendingEmailId(null)
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
        {canManageInvoices && (
          <Button onClick={() => router.push(`/invoices/create${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`)} className="w-full gap-2 sm:w-auto">
            <Plus className="size-4" />
            Add Invoice
          </Button>
        )}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search invoices..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to start tracking billing and payments."
          action={canManageInvoices ? {
            label: 'Add Invoice',
            onClick: () => router.push(`/invoices/create${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`),
          } : undefined}
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
                  <th className="px-5 py-4 font-semibold">Balance</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((invoice) => (
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
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${Number(invoice.balance_amount ?? invoice.balanceAmount ?? Math.max(0, Number(invoice.total ?? 0) - Number(invoice.amountPaid ?? 0))).toLocaleString()}
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
                              onClick={() => setPayingInvoice(invoice)}
                              disabled={(invoice.payment_status ?? invoice.paymentStatus) === 'completed'}
                              className={cn(
                                'gap-2 cursor-pointer text-xs',
                                (invoice.payment_status ?? invoice.paymentStatus) === 'completed' && 'cursor-not-allowed opacity-50',
                              )}
                            >
                              <WalletCards className="size-4" />
                              Pay
                            </DropdownMenuItem>
                            {canManageInvoices && <DropdownMenuItem
                              onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>}
                            <DropdownMenuItem
                              onClick={() => void downloadInvoice(invoice.id)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Download className="size-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {activeChannels.includes('sms') && <DropdownMenuItem onClick={() => setMessageTarget({ channel: 'sms', companyId: selectedCompany, customerId: invoice.taskCard?.quotation?.vehicle?.customer?.id })} className="gap-2 cursor-pointer text-xs"><Send className="size-4" />Send SMS</DropdownMenuItem>}
                            {canManageInvoices && activeChannels.includes('email') && <DropdownMenuItem onClick={() => void sendInvoiceEmail(invoice.id)} disabled={sendingEmailId === invoice.id} className="gap-2 cursor-pointer text-xs"><Mail className="size-4" />{sendingEmailId === invoice.id ? 'Sending Email...' : 'Send Email'}</DropdownMenuItem>}
                            {activeChannels.includes('whatsapp') && <DropdownMenuItem onClick={() => setMessageTarget({ channel: 'whatsapp', companyId: selectedCompany, customerId: invoice.taskCard?.quotation?.vehicle?.customer?.id })} className="gap-2 cursor-pointer text-xs"><MessageCircle className="size-4" />Send WhatsApp</DropdownMenuItem>}
                            {canManageInvoices && <DropdownMenuItem
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
                            </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length > 0 && filteredRows.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">No invoices match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <InvoicePaymentDialog
        invoice={payingInvoice}
        open={Boolean(payingInvoice)}
        onOpenChange={(open) => {
          if (!open) setPayingInvoice(null)
        }}
        onPaymentCreated={loadInvoices}
      />
      <SendCustomerMessageDialog channel={messageTarget?.channel ?? null} companyId={messageTarget?.companyId} customerId={messageTarget?.customerId} documentLabel="this invoice" onOpenChange={(open) => !open && setMessageTarget(null)} />
    </div>
  )
}
