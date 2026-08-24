'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, FileText, User, CarFront, MoreHorizontal, Trash2, Download, Mail, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { generateQuotationPdf, type QuotationPdfPayload } from '@/components/quotations/quotation-form-page'
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

export default function QuotationsPage() {
  const router = useRouter()
  const { customers, vehicles } = useGarageStore()
  const { selectedCompany } = useBranch()
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [vehicleId, setVehicleId] = useState<string | undefined>()
  const [activeChannels, setActiveChannels] = useState<CommunicationChannel[]>([])
  const [messageTarget, setMessageTarget] = useState<{ channel: CommunicationChannel; customerId?: string | number; companyId?: string | number } | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<string | number | null>(null)

  useEffect(() => {
    setVehicleId(new URLSearchParams(window.location.search).get('vehicle_id') ?? undefined)
  }, [])

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const query = vehicleId ? `?vehicle_id=${encodeURIComponent(vehicleId)}` : ''
        const response = await fetch(`/backend-api/quotations${query}`)
        const result = await response.json()
        if (!response.ok || result.success === false) {
          throw new Error(result.message || 'Unable to load quotations.')
        }
        setRows(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load quotations.')
      }
    }

    void loadQuotations()
  }, [vehicleId])

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

  const createQuotationPath = vehicleId
    ? `/quotations/create?vehicle_id=${encodeURIComponent(vehicleId)}`
    : '/quotations/create'

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId)
    return customer ? `${customer.firstName} ${customer.lastName}` : '—'
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model}` : '—'
  }

  const downloadQuotation = async (quotationId: string | number) => {
    try {
      const response = await fetch(`/backend-api/quotations/${quotationId}`)
      const result = await response.json()
      if (!response.ok || result.success === false || !result.data) {
        throw new Error(result.message || 'Unable to load quotation for download.')
      }

      const quotation = result.data
      const companyResponse = await fetch(`/backend-api/companies/${quotation.company_id}`)
      const companyResult = await companyResponse.json()
      if (!companyResponse.ok || companyResult.success === false || !companyResult.data) {
        throw new Error(companyResult.message || 'Unable to load quotation company.')
      }

      const company = companyResult.data
      const vehicle = quotation.vehicle ?? {}
      const customer = vehicle.customer ?? {}
      const customerName = customer.name ?? ([customer.first_name ?? customer.firstName, customer.last_name ?? customer.lastName].filter(Boolean).join(' ') || '—')
      const companyAddress = [company.address, company.city, company.state, company.zip_code ?? company.zipCode].filter(Boolean).join(', ') || '—'
      const payload: QuotationPdfPayload = {
        companyName: company.name ?? 'Company',
        companyEmail: company.email ?? '—',
        companyCountry: company.country ?? '—',
        companyPhone: company.phone ?? '—',
        companyAddress,
        companyRegNo: company.registration_no ?? company.registrationNo ?? '—',
        companyLogoUrl: company.logo_url ?? company.logoUrl ?? company.logo,
        quotationNumber: quotation.quotation_number ?? String(quotation.id),
        creationDate: quotation.creation_date ?? '',
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
        note: quotation.note ?? '',
        includeLineItems: (quotation.details ?? []).length > 0,
        lineItems: (quotation.details ?? []).map((detail: any) => ({
          type: detail.type,
          description: detail.description ?? '',
          qty: Number(detail.qty ?? 0),
          unitPrice: Number(detail.unit_price ?? 0),
        })),
        subtotal: Number(quotation.subtotal ?? 0),
        taxPercentage: Number(quotation.tax_percentage ?? 0),
        taxAmount: Number(quotation.tax_amount ?? 0),
        discountPercentage: Number(quotation.discount_percentage ?? 0),
        discountAmount: Number(quotation.discount ?? 0),
        total: Number(quotation.total ?? 0),
      }

      await generateQuotationPdf(payload)
      toast.success('Quotation PDF downloaded.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download quotation.')
    }
  }

  const sendQuotationEmail = async (quotationId: string | number) => {
    try {
      setSendingEmailId(quotationId)
      const response = await fetch('/backend-api/email/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotation_id: quotationId }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || 'Unable to send quotation email.')
      }
      toast.success(result.message || 'Quotation email sent successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send quotation email.')
    } finally {
      setSendingEmailId(null)
    }
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
        <Button onClick={() => router.push(createQuotationPath)} className="w-full gap-2 sm:w-auto">
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
            onClick: () => router.push(createQuotationPath),
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
                        <span>{quotation.quotation_number ?? quotation.quotationNumber ?? quotation.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>{quotation.vehicle?.customer?.name ?? getCustomerName(quotation.customer_id ?? quotation.customerId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <CarFront className="size-4 text-muted-foreground" />
                        <span>
                          {quotation.vehicle?.name ??
                            ([quotation.vehicle?.make, quotation.vehicle?.model].filter(Boolean).join(' ') ||
                              getVehicleName(quotation.vehicle_id ?? quotation.vehicleId))}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          (quotation.quotation_status ?? quotation.quotationStatus ?? quotation.status) === 'accepted' && 'bg-emerald-500/10 text-emerald-700',
                          (quotation.quotation_status ?? quotation.quotationStatus ?? quotation.status) === 'draft' && 'bg-slate-500/10 text-slate-700',
                          (quotation.quotation_status ?? quotation.quotationStatus ?? quotation.status) === 'sent' && 'bg-blue-500/10 text-blue-700',
                          (quotation.quotation_status ?? quotation.quotationStatus ?? quotation.status) === 'rejected' && 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {quotation.quotation_status ?? quotation.quotationStatus ?? quotation.status ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      ${Number(quotation.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(quotation.creation_date ?? quotation.createdAt).toLocaleDateString()}
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
                              onClick={() => void downloadQuotation(quotation.id)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Download className="size-4" />
                              Download Quotation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/quotations/edit/${quotation.id}${vehicleId ? `?vehicle_id=${encodeURIComponent(vehicleId)}` : ''}`)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/task-cards?quotation_id=${encodeURIComponent(String(quotation.id))}`)}
                              className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              <FileText className="size-4 text-blue-600" />
                              Task Card
                            </DropdownMenuItem>
                            {activeChannels.includes('sms') && <DropdownMenuItem onClick={() => setMessageTarget({ channel: 'sms', companyId: selectedCompany, customerId: quotation.vehicle?.customer?.id })} className="gap-2 cursor-pointer text-xs"><Send className="size-4" />Send SMS</DropdownMenuItem>}
                            {activeChannels.includes('email') && <DropdownMenuItem onClick={() => void sendQuotationEmail(quotation.id)} disabled={sendingEmailId === quotation.id} className="gap-2 cursor-pointer text-xs"><Mail className="size-4" />{sendingEmailId === quotation.id ? 'Sending Email...' : 'Send Email'}</DropdownMenuItem>}
                            {activeChannels.includes('whatsapp') && <DropdownMenuItem onClick={() => setMessageTarget({ channel: 'whatsapp', companyId: selectedCompany, customerId: quotation.vehicle?.customer?.id })} className="gap-2 cursor-pointer text-xs"><MessageCircle className="size-4" />Send WhatsApp</DropdownMenuItem>}
                            <DropdownMenuItem
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this quotation?')) {
                                  try {
                                    const response = await fetch(`/backend-api/quotations/${quotation.id}`, { method: 'DELETE' })
                                    const result = await response.json().catch(() => ({}))
                                    if (!response.ok || result.success === false) {
                                      throw new Error(result.message || 'Unable to delete quotation.')
                                    }
                                    setRows((currentRows) => currentRows.filter((item) => item.id !== quotation.id))
                                    toast.success('Quotation deleted successfully')
                                  } catch (error) {
                                    toast.error(error instanceof Error ? error.message : 'Unable to delete quotation.')
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
      <SendCustomerMessageDialog channel={messageTarget?.channel ?? null} companyId={messageTarget?.companyId} customerId={messageTarget?.customerId} documentLabel="this quotation" onOpenChange={(open) => !open && setMessageTarget(null)} />
    </div>
  )
}
