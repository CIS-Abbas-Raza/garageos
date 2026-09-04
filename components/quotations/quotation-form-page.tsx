'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Building2,
  Download,
  Edit3,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { useBranch } from '@/lib/branch-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { quotationSchema, type QuotationFormData } from '@/lib/schemas'
import { useGarageStore, defaultCompanies } from '@/lib/store/garage-store'
import type { LineItem as StoreLineItem } from '@/lib/types/store'
import { cn } from '@/lib/utils'

type QuotationMode = 'create' | 'edit'

type QuotationFormPageProps = {
  mode: QuotationMode
  quotationId?: string
}

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

const money = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const formatMoney = (value: number) => money.format(roundMoney(value))

const formatDateInput = (value?: string | Date) => {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

const formatPersonName = (firstName?: string, lastName?: string) => {
  const name = [firstName, lastName].filter((part) => part && part.trim()).join(' ').trim()
  return name || '—'
}

const isValidImageSource = (value?: string) =>
  Boolean(value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('/')))

const PDF_MARGIN = 40
const PDF_PAGE_WIDTH = 595.28
const PDF_BODY_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2
const BRAND_COLOR: [number, number, number] = [37, 99, 235]
const BORDER: [number, number, number] = [226, 232, 240]

const safePdfText = (value: unknown, fallback = '—') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text || fallback
}

const resolveImageDataUrl = async (src?: string) => {
  if (!isValidImageSource(src)) return undefined
  if (src?.startsWith('data:')) return src
  try {
    const response = await fetch(src as string)
    if (!response.ok) return undefined
    const blob = await response.blob()
    return await new Promise<string | undefined>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(blob)
    })
  } catch {
    return undefined
  }
}

const createLogoFallback = (companyName: string) =>
  companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C'

type PdfQuotationLineItem = {
  type: string
  description: string
  qty: number
  unitPrice: number
}

export type QuotationPdfPayload = {
  companyName: string
  companyEmail: string
  companyCountry: string
  companyPhone: string
  companyAddress: string
  companyRegNo: string
  companyLogoUrl?: string
  quotationNumber: string
  creationDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vin: string
  licensePlate: string
  note: string
  includeLineItems: boolean
  lineItems: PdfQuotationLineItem[]
  subtotal: number
  taxPercentage: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  total: number
}

export const generateQuotationPdf = async (payload: QuotationPdfPayload) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_MARGIN
  const contentWidth = pageWidth - margin * 2
  const dark = [0, 0, 0] as [number, number, number]
  const companyName = payload.companyName?.trim() || 'Company'
  const companyInitials = createLogoFallback(companyName)
  const logoDataUrl = await resolveImageDataUrl(payload.companyLogoUrl)
  let y = margin

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...dark)
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', margin, y, 60, 60, undefined, 'FAST')
  } else {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    doc.circle(margin + 30, y + 30, 28, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(17)
    doc.text(companyInitials, margin + 30, y + 36, { align: 'center' })
  }

  const textStartX = margin + 78
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(companyName, textStartX, y + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const companyLines = [
    `Email: ${safePdfText(payload.companyEmail)}  |  Phone: ${safePdfText(payload.companyPhone)}`,
    `Address: ${safePdfText(payload.companyAddress)}  |  Reg No: ${safePdfText(payload.companyRegNo)}`,
  ]
  companyLines.forEach((line, index) => {
    doc.text(line, textStartX, y + 38 + index * 13)
  })

  const metaX = pageWidth - margin - 180
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setCharSpace(1.4)
  doc.text('QUOTATION', metaX + 180, y + 18, { align: 'right' })
  doc.setCharSpace(0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Quotation # ${safePdfText(payload.quotationNumber)}`, metaX + 180, y + 38, { align: 'right' })
  doc.text(`Date: ${safePdfText(payload.creationDate)}`, metaX + 180, y + 54, { align: 'right' })

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.line(margin, y + 72, pageWidth - margin, y + 72)
  y += 92

  const leftColX = margin
  const rightColX = margin + contentWidth / 2 + 10
  const colWidth = contentWidth / 2 - 10

  const drawSection = (x: number, title: string, lines: string[]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setCharSpace(1.2)
    doc.text(title.toUpperCase(), x, y)
    doc.setCharSpace(0)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lineTop = y + 18
    lines.forEach((line, index) => {
      const parts = doc.splitTextToSize(safePdfText(line), colWidth)
      doc.text(parts, x, lineTop + index * 15)
    })
  }

  drawSection(leftColX, 'Customer Detail', [
    `Name: ${safePdfText(payload.customerName)}`,
    `Email: ${safePdfText(payload.customerEmail)}`,
    `Phone: ${safePdfText(payload.customerPhone)}`,
    `Address: ${safePdfText(payload.customerAddress)}`,
  ])

  drawSection(rightColX, 'Vehicle Detail', [
    `Make: ${safePdfText(payload.vehicleMake)}`,
    `Model: ${safePdfText(payload.vehicleModel)}`,
    `Year: ${safePdfText(payload.vehicleYear)}`,
    `VIN: ${safePdfText(payload.vin)}`,
    `License Plate: ${safePdfText(payload.licensePlate)}`,
  ])

  const detailSectionHeight = 18 + 5 * 15 + 10
  y += detailSectionHeight
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 18

  const isEnabled = payload.includeLineItems !== false

  const pdfItems = payload.lineItems.length > 0
    ? payload.lineItems
    : [{ type: 'service', description: '—', qty: 0, unitPrice: 0 }]

  const lineItemsBody = pdfItems.map((item) => [
    item.type === 'service' ? 'Service' : 'Parts',
    safePdfText(item.description, '—'),
    isEnabled ? String(Number(item.qty ?? 0)) : '0',
    formatMoney(isEnabled ? Number(item.unitPrice ?? 0) : 0),
    formatMoney(isEnabled ? roundMoney(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0)) : 0),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Type', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: lineItemsBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 7, textColor: dark, lineColor: BORDER, lineWidth: 0.5, valign: 'middle' },
    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [250, 251, 253] },
    columnStyles: { 0: { cellWidth: 72 }, 1: { cellWidth: 250 }, 2: { halign: 'right', cellWidth: 42 }, 3: { halign: 'right', cellWidth: 82 }, 4: { halign: 'right', cellWidth: 82 } },
  })

  y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 18 : y + 18
  if (y + 172 > pageHeight - margin) {
    doc.addPage()
    y = margin
  }

  const summaryWidth = 270
  const summaryX = pageWidth - margin - summaryWidth
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setCharSpace(1.1)
  doc.setTextColor(0, 0, 0)
  doc.text('SUMMARY', summaryX, y)
  doc.setCharSpace(0)
  doc.setLineWidth(1)
  doc.line(summaryX, y + 6, summaryX + summaryWidth, y + 6)

  const summaryRows: Array<[string, string]> = [
    ['Subtotal', formatMoney(isEnabled ? payload.subtotal : 0)],
    [`Tax (${isEnabled ? payload.taxPercentage : 0}%)`, formatMoney(isEnabled ? payload.taxAmount : 0)],
    [`Discount (${isEnabled ? payload.discountPercentage : 0}%)`, formatMoney(isEnabled ? payload.discountAmount : 0)],
  ]

  let rowY = y + 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  summaryRows.forEach(([label, value], index) => {
    doc.text(label, summaryX, rowY)
    doc.text(value, summaryX + summaryWidth, rowY, { align: 'right' })
    rowY += 20
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setDrawColor(0, 0, 0)
  doc.line(summaryX, rowY - 2, summaryX + summaryWidth, rowY - 2)
  doc.text('Total', summaryX, rowY + 16)
  doc.text(formatMoney(isEnabled ? payload.total : 0), summaryX + summaryWidth, rowY + 16, { align: 'right' })

  y = rowY + 30
  if (payload.note?.trim()) {
    if (y + 52 > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setCharSpace(1.1)
    doc.text('NOTE', margin, y)
    doc.setCharSpace(0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const noteLines = doc.splitTextToSize(safePdfText(payload.note), contentWidth)
    doc.text(noteLines, margin, y + 14)
    y += noteLines.length * 12 + 18
  }

  doc.save(`Quotation-${safePdfText(payload.quotationNumber, 'quotation').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`)
}

const initialLineItem = (): QuotationFormData['lineItems'][number] => ({
  type: 'service',
  description: 'General service and inspection',
  qty: 1,
  unitPrice: 0,
  amount: 0,
})

const normalizeLineItem = (
  item?: Partial<QuotationFormData['lineItems'][number]> & {
    type?: 'service' | 'parts' | 'labour'
    quantity?: number
    unit_price?: number
    total?: number
  },
): QuotationFormData['lineItems'][number] => {
  const qty = Number(item?.qty ?? item?.quantity ?? 1)
  const unitPrice = Number(item?.unitPrice ?? item?.unit_price ?? 0)
  const amount = Number(item?.amount ?? item?.total ?? 0)
  return {
    type: item?.type === 'parts' ? 'parts' : 'service',
    description: item?.description ?? '',
    qty: Number.isFinite(qty) ? qty : 1,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    amount: Number.isFinite(amount)
      ? amount
      : roundMoney((Number.isFinite(qty) ? qty : 1) * (Number.isFinite(unitPrice) ? unitPrice : 0)),
  }
}

function QuotationPrintView({
  companyName,
  companyEmail,
  companyCountry,
  companyPhone,
  companyAddress,
  companyRegNo,
  companyLogoUrl,
  quotationNumber,
  creationDate,
  note,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vin,
  licensePlate,
  includeLineItems,
  lineItems,
  subtotal,
  taxPercentage,
  taxAmount,
  discountPercentage,
  discountAmount,
  total,
}: {
  companyName: string
  companyEmail: string
  companyCountry: string
  companyPhone: string
  companyAddress: string
  companyRegNo: string
  companyLogoUrl?: string
  quotationNumber: string
  creationDate: string
  note: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vin: string
  licensePlate: string
  includeLineItems: boolean
  lineItems: QuotationFormData['lineItems']
  subtotal: number
  taxPercentage: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  total: number
}) {
  const companyInitials = createLogoFallback(companyName)

  return (
    <div className="print-only hidden bg-white text-slate-900">
      <div className="mx-auto max-w-5xl p-8">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-lg font-bold text-slate-700 shrink-0">
              {companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogoUrl} alt={companyName} className="size-full object-cover" />
              ) : (
                companyInitials
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{companyName}</h1>
              <div className="mt-1 grid gap-0.5 text-xs text-slate-600 sm:grid-cols-2 sm:gap-x-4">
                <p>Email: {companyEmail}</p>
                <p>Phone: {companyPhone}</p>
                <p>Country: {companyCountry}</p>
                <p>Reg No: {companyRegNo}</p>
                <p className="sm:col-span-2">Address: {companyAddress}</p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-slate-600 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Quotation</p>
            <p className="font-semibold text-slate-900">#{quotationNumber}</p>
            <p className="mt-1 text-xs">Date: {creationDate}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-5 space-y-1.5 text-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Customer Detail</h2>
            <p><span className="text-slate-500">Name:</span> {customerName}</p>
            <p><span className="text-slate-500">Email:</span> {customerEmail}</p>
            <p><span className="text-slate-500">Phone:</span> {customerPhone}</p>
            <p><span className="text-slate-500">Address:</span> {customerAddress}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 space-y-1.5 text-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Vehicle Detail</h2>
            <p><span className="text-slate-500">Make:</span> {vehicleMake}</p>
            <p><span className="text-slate-500">Model:</span> {vehicleModel}</p>
            <p><span className="text-slate-500">Year:</span> {vehicleYear}</p>
            <p><span className="text-slate-500">VIN:</span> {vin}</p>
            <p><span className="text-slate-500">License Plate:</span> {licensePlate}</p>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Quotation Details</h2>
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Unit Price</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item, index) => (
                <tr key={`${item.description}-${index}`}>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{includeLineItems ? item.qty : 0}</td>
                  <td className="px-4 py-3">{formatMoney(includeLineItems ? item.unitPrice : 0)}</td>
                  <td className="px-4 py-3">{formatMoney(includeLineItems ? Number(item.qty ?? 0) * Number(item.unitPrice ?? 0) : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 ml-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatMoney(includeLineItems ? subtotal : 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tax ({includeLineItems ? taxPercentage : 0}%)</span>
              <span className="font-semibold text-slate-900">{formatMoney(includeLineItems ? taxAmount : 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Discount ({includeLineItems ? discountPercentage : 0}%)</span>
              <span className="font-semibold text-slate-900">{formatMoney(includeLineItems ? discountAmount : 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">{formatMoney(includeLineItems ? total : 0)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function QuotationFormPage({ mode, quotationId }: QuotationFormPageProps) {
  const router = useRouter()
  const { selectedCompany } = useBranch()
  const { user } = useAuth()
  const {
    companies,
    customers,
    vehicles,
    estimations,
    settings,
    addEstimation,
    addCustomer,
    addVehicle,
    updateEstimation,
  } = useGarageStore()
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string | undefined>()
  const [apiQuotation, setApiQuotation] = useState<any>()
  const [apiVehicle, setApiVehicle] = useState<any>()
  const [apiCustomer, setApiCustomer] = useState<any>()
  const [apiCompany, setApiCompany] = useState<any>()
  const [isQuotationLoading, setIsQuotationLoading] = useState(mode === 'edit')

  useEffect(() => {
    setPreselectedVehicleId(new URLSearchParams(window.location.search).get('vehicle_id') ?? undefined)
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !quotationId) return

    const loadQuotation = async () => {
      try {
        const response = await fetch(`/backend-api/quotations/${quotationId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load quotation.')
        }
        const record = result.data
        const vehicleResponse = await fetch(`/backend-api/vehicles/${record.vehicle_id}`)
        const vehicleResult = await vehicleResponse.json()
        if (!vehicleResponse.ok || vehicleResult.success === false || !vehicleResult.data) {
          throw new Error(vehicleResult.message || 'Unable to load vehicle details.')
        }

        const vehicle = vehicleResult.data
        const customerId = vehicle.customer_id ?? vehicle.customerId
        setApiVehicle(vehicle)

        if (customerId) {
          const customerResponse = await fetch(`/backend-api/customers/${customerId}`)
          const customerResult = await customerResponse.json()
          if (!customerResponse.ok || customerResult.success === false || !customerResult.data) {
            throw new Error(customerResult.message || 'Unable to load customer details.')
          }
          setApiCustomer(customerResult.data)
        }

        setApiQuotation({
          ...record,
          companyId: record.company_id,
          customerId: customerId ? String(customerId) : undefined,
          vehicleId: String(record.vehicle_id),
          quotationNumber: record.quotation_number,
          note: record.note,
          quotationStatus: record.quotation_status,
          creationDate: record.creation_date,
          taxPercentage: Number(record.tax_percentage ?? 0),
          discountPercentage: Number(record.discount_percentage ?? 0),
          documentNames: (record.documents ?? []).map((document: any) => document.document),
          lineItems: (record.details ?? []).map((detail: any) => ({
            id: String(detail.id),
            type: detail.type === 'service' ? 'labour' : 'parts',
            description: detail.description ?? '',
            quantity: Number(detail.qty ?? 0),
            unitPrice: Number(detail.unit_price ?? 0),
            total: Number(detail.qty ?? 0) * Number(detail.unit_price ?? 0),
          })),
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load quotation.')
      } finally {
        setIsQuotationLoading(false)
      }
    }

    void loadQuotation()
  }, [mode, quotationId])

  const quotation = useMemo<any>(
    () => (mode === 'edit' && quotationId ? apiQuotation ?? estimations.find((item) => item.id === quotationId) : undefined),
    [mode, quotationId, apiQuotation, estimations],
  )

  const activeCompanies = companies.length > 0 ? companies : defaultCompanies
  const companyId = quotation?.companyId ? String(quotation.companyId) : selectedCompany ?? activeCompanies[0]?.id

  useEffect(() => {
    if (!companyId) {
      setApiCompany(undefined)
      return
    }

    let cancelled = false
    const loadCompany = async () => {
      try {
        const response = await fetch(`/backend-api/companies/${companyId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load company details.')
        }
        if (!cancelled) setApiCompany(result.data)
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Unable to load company details.')
      }
    }

    void loadCompany()
    return () => { cancelled = true }
  }, [companyId])

  const currentCompany = apiCompany?.id && String(apiCompany.id) === String(companyId)
    ? apiCompany
    : activeCompanies.find((company) => company.id === companyId) ?? activeCompanies[0]
  const currentSettings = currentCompany?.id ? settings[currentCompany.id] : undefined
  const rawCompanyLogo =
    currentSettings?.logoUrl ??
    (currentCompany as { logoUrl?: string; logo?: string } | undefined)?.logoUrl ??
    (currentCompany as { logoUrl?: string; logo?: string } | undefined)?.logo
  const companyLogoUrl = isValidImageSource(rawCompanyLogo) ? rawCompanyLogo : undefined
  const companyInitials = createLogoFallback(currentCompany?.name ?? 'Company')

  const companyName = currentCompany?.name ?? 'Company'
  const companyEmail = currentCompany?.email ?? '—'
  const companyCountry = (currentCompany as any)?.country ?? '—'
  const companyPhone = currentCompany?.phone ?? '—'
  const companyAddress = [currentCompany?.address, currentCompany?.city, currentCompany?.state, currentCompany?.zipCode]
    .filter(Boolean)
    .join(', ') || '—'
  const companyRegNo = (currentCompany as any)?.registration_no ?? (currentCompany as any)?.registrationNo ?? '—'

  const [includeLineItems, setIncludeLineItems] = useState<boolean>(() => (quotation as any)?.includeLineItems ?? false)

  // On edit, enable the section only when the saved quotation has details.
  useEffect(() => {
    const hasDetails = Boolean(quotation?.lineItems?.length)
    setIncludeLineItems((current) => current === hasDetails ? current : hasDetails)
  }, [quotation])

  const initialDocuments = useMemo<string[]>(() => {
    if ((quotation as any)?.documentNames && Array.isArray((quotation as any).documentNames)) {
      return (quotation as any).documentNames
    }
    if (quotation?.documentName) {
      return [quotation.documentName]
    }
    return []
  }, [quotation])

  const [uploadedFiles, setUploadedFiles] = useState<string[]>(initialDocuments)
  // Keep the browser File objects separately from their display names. Names alone
  // cannot be uploaded in a multipart request.
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  useEffect(() => {
    setUploadedFiles(initialDocuments)
  }, [initialDocuments])

  const defaultValues = useMemo<QuotationFormData>(() => {
    const defaultCustomerId = quotation?.customerId ?? customers[0]?.id ?? 'demo-customer'
    const defaultVehicle =
      quotation?.vehicleId ??
      preselectedVehicleId ??
      vehicles.find((vehicle) => vehicle.customerId === defaultCustomerId)?.id ??
      vehicles[0]?.id ??
      'demo-vehicle'

    return {
      quotationNumber: quotation?.quotationNumber ?? `QT-${Date.now()}`,
      customerId: defaultCustomerId,
      vehicleId: defaultVehicle,
      mileage: quotation?.mileage ?? 0,
      note: quotation?.note ?? quotation?.description ?? 'General vehicle service quotation',
      status: quotation?.quotationStatus ?? quotation?.status ?? 'draft',
      creationDate: formatDateInput(quotation?.creationDate ?? quotation?.createdAt),
      documentName: quotation?.documentName ?? '',
      taxPercentage: quotation?.taxPercentage ?? quotation?.tax_percentage ?? 0,
      discountPercentage: quotation?.discountPercentage ?? quotation?.discount_percentage ?? 0,
      subtotal: quotation?.subtotal ?? 0,
      taxAmount: quotation?.taxAmount ?? quotation?.tax ?? 0,
      discountAmount: quotation?.discountAmount ?? quotation?.discount ?? 0,
      total: quotation?.total ?? 0,
      lineItems: includeLineItems && quotation?.lineItems?.length
        ? quotation.lineItems.map((item: any) => normalizeLineItem(item))
        : includeLineItems ? [initialLineItem()] : [],
    }
  }, [quotation, customers, vehicles, preselectedVehicleId, includeLineItems])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (quotation) reset(defaultValues)
  }, [quotation, defaultValues, reset])

  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name: 'lineItems',
  })

  const watchedLineItems = useWatch({ control, name: 'lineItems' }) ?? []
  const watchedCustomerId = useWatch({ control, name: 'customerId' })
  const watchedVehicleId = useWatch({ control, name: 'vehicleId' })
  const watchedTaxPercentage = Number(useWatch({ control, name: 'taxPercentage' }) ?? 0)
  const watchedDiscountPercentage = Number(useWatch({ control, name: 'discountPercentage' }) ?? 0)

  useEffect(() => {
    if (mode === 'create' && preselectedVehicleId) {
      setValue('vehicleId', preselectedVehicleId, { shouldDirty: false, shouldValidate: true })
    }
  }, [mode, preselectedVehicleId, setValue])

  useEffect(() => {
    if (!currentCompany?.id || customers.length > 0) return

    const customerId = addCustomer({
      companyId: currentCompany.id,
      firstName: 'Demo',
      lastName: 'Customer',
      email: 'demo.customer@example.com',
      phone: '+1 555-0100',
      address: '123 Demo Street',
      city: currentCompany.city || 'New York',
      zipCode: currentCompany.zipCode || '10001',
    })
    setValue('customerId', customerId, { shouldDirty: false, shouldValidate: true })
  }, [addCustomer, currentCompany, customers.length, setValue])

  useEffect(() => {
    if (!currentCompany?.id || customers.length === 0 || vehicles.length > 0) return

    const vehicleId = addVehicle({
      companyId: currentCompany.id,
      customerId: customers[0].id,
      make: 'Toyota',
      model: 'Corolla',
      year: new Date().getFullYear(),
      vin: 'DEMO-VIN-0001',
      licensePlate: 'DEMO-001',
      mileage: 0,
    })
    setValue('vehicleId', vehicleId, { shouldDirty: false, shouldValidate: true })
  }, [addVehicle, currentCompany, customers, setValue, vehicles.length])

  useEffect(() => {
    if (customers.length === 0) {
      setValue('customerId', 'demo-customer', { shouldDirty: false, shouldValidate: true })
    }
    if (vehicles.length === 0) {
      setValue('vehicleId', 'demo-vehicle', { shouldDirty: false, shouldValidate: true })
    }
  }, [customers.length, setValue, vehicles.length])

  const actualSubtotal = useMemo(
    () =>
      roundMoney(
        watchedLineItems.reduce((sum, item) => sum + Number(item?.qty ?? 0) * Number(item?.unitPrice ?? 0), 0),
      ),
    [watchedLineItems],
  )
  const actualTaxAmount = useMemo(() => roundMoney((actualSubtotal * watchedTaxPercentage) / 100), [actualSubtotal, watchedTaxPercentage])
  const actualDiscountAmount = useMemo(
    () => roundMoney((actualSubtotal * watchedDiscountPercentage) / 100),
    [actualSubtotal, watchedDiscountPercentage],
  )
  const actualTotal = useMemo(() => roundMoney(actualSubtotal + actualTaxAmount - actualDiscountAmount), [actualSubtotal, actualTaxAmount, actualDiscountAmount])

  const subtotal = includeLineItems ? actualSubtotal : 0
  const taxAmount = includeLineItems ? actualTaxAmount : 0
  const discountAmount = includeLineItems ? actualDiscountAmount : 0
  const total = includeLineItems ? actualTotal : 0

  useEffect(() => {
    if (!watchedCustomerId && customers[0]?.id) {
      setValue('customerId', customers[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [customers, watchedCustomerId, setValue])

  useEffect(() => {
    if (!watchedVehicleId) {
      setApiVehicle(undefined)
      return
    }

    let cancelled = false
    const loadVehicle = async () => {
      try {
        const response = await fetch(`/backend-api/vehicles/${watchedVehicleId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load vehicle details.')
        }
        if (cancelled) return

        const vehicle = result.data
        setApiVehicle(vehicle)
        const customerId = vehicle.customer_id ?? vehicle.customerId
        if (customerId && String(customerId) !== watchedCustomerId) {
          setValue('customerId', String(customerId), { shouldDirty: false, shouldValidate: true })
        }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Unable to load vehicle details.')
      }
    }

    void loadVehicle()
    return () => { cancelled = true }
  }, [watchedVehicleId, watchedCustomerId, setValue])

  useEffect(() => {
    if (!watchedCustomerId) {
      setApiCustomer(undefined)
      return
    }

    let cancelled = false
    const loadCustomer = async () => {
      try {
        const response = await fetch(`/backend-api/customers/${watchedCustomerId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load customer details.')
        }
        if (!cancelled) setApiCustomer(result.data)
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Unable to load customer details.')
      }
    }

    void loadCustomer()
    return () => { cancelled = true }
  }, [watchedCustomerId])

  const selectedCustomer = apiCustomer?.id && String(apiCustomer.id) === watchedCustomerId
    ? apiCustomer
    : customers.find((customer) => customer.id === watchedCustomerId)
  const customerDisplayName = selectedCustomer?.name ?? formatPersonName(selectedCustomer?.firstName, selectedCustomer?.lastName)
  const customerEmail = selectedCustomer?.email ?? '—'
  const customerPhone = selectedCustomer?.phone ?? '—'
  const customerAddress = selectedCustomer?.address ?? '—'

  const filteredVehicles = useMemo(
    () =>
      watchedCustomerId
        ? vehicles.filter((vehicle) => vehicle.customerId === watchedCustomerId)
        : vehicles,
    [vehicles, watchedCustomerId],
  )

  useEffect(() => {
    if (apiVehicle?.id && String(apiVehicle.id) === watchedVehicleId) return
    if (mode === 'create' && preselectedVehicleId === watchedVehicleId) return
    if (filteredVehicles.length === 0) return
    const currentVehicle = filteredVehicles.find((vehicle) => vehicle.id === watchedVehicleId)
    if (!currentVehicle) {
      setValue('vehicleId', filteredVehicles[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [apiVehicle, filteredVehicles, mode, preselectedVehicleId, watchedVehicleId, setValue])

  const selectedVehicle = apiVehicle?.id && String(apiVehicle.id) === watchedVehicleId
    ? apiVehicle
    : vehicles.find((vehicle) => vehicle.id === watchedVehicleId)
  const vehicleDisplayName = selectedVehicle
    ? (selectedVehicle as any).name || [selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ') || '—'
    : '—'
  const vehicleMake = selectedVehicle?.make ?? '—'
  const vehicleModel = selectedVehicle?.model ?? '—'
  const vehicleVariant = (selectedVehicle as any)?.variant ?? '—'
  const vehicleYear = selectedVehicle?.year ? String(selectedVehicle.year) : '—'
  const vehicleVin = selectedVehicle?.vin ?? (selectedVehicle as any)?.VIN ?? '—'
  const vehicleLicensePlate = selectedVehicle?.licensePlate ?? (selectedVehicle as any)?.license_plate ?? '—'
  const vehicleInsured = Number((selectedVehicle as any)?.insured) === 1 ? 'Yes' : 'No'

  useEffect(() => {
    watchedLineItems.forEach((item, index) => {
      const nextAmount = roundMoney(Number(item?.qty ?? 0) * Number(item?.unitPrice ?? 0))
      if (Number(item?.amount ?? 0) !== nextAmount) {
        setValue(`lineItems.${index}.amount`, nextAmount, {
          shouldDirty: true,
          shouldValidate: false,
        })
      }
    })
  }, [watchedLineItems, setValue])

  useEffect(() => {
    if (Number(getValues('subtotal') ?? 0) !== subtotal) {
      setValue('subtotal', subtotal, { shouldDirty: true, shouldValidate: false })
    }
    if (Number(getValues('taxAmount') ?? 0) !== taxAmount) {
      setValue('taxAmount', taxAmount, { shouldDirty: true, shouldValidate: false })
    }
    if (Number(getValues('discountAmount') ?? 0) !== discountAmount) {
      setValue('discountAmount', discountAmount, { shouldDirty: true, shouldValidate: false })
    }
    if (Number(getValues('total') ?? 0) !== total) {
      setValue('total', total, { shouldDirty: true, shouldValidate: false })
    }
  }, [subtotal, taxAmount, discountAmount, total, getValues, setValue])

  const handleDownloadPdf = async () => {
    if (!currentCompany?.id) {
      toast.error('Please select a company before downloading the quotation PDF.')
      return
    }

    const values = getValues()
    const mileageValue = Number(values.mileage ?? quotation?.mileage ?? 0)
    const payload: QuotationPdfPayload = {
      companyName,
      companyEmail,
      companyCountry,
      companyPhone,
      companyAddress,
      companyRegNo,
      companyLogoUrl,
      quotationNumber: values.quotationNumber || `QT-${Date.now()}`,
      creationDate: values.creationDate || formatDateInput(),
      customerName: customerDisplayName,
      customerEmail,
      customerPhone,
      customerAddress,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vin: vehicleVin,
      licensePlate: vehicleLicensePlate,
      note: values.note ?? '',
      includeLineItems,
      lineItems: (values.lineItems ?? []).map((item) => ({
        type: item.type,
        description: item.description,
        qty: Number(item.qty ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      })),
      subtotal: actualSubtotal,
      taxPercentage: watchedTaxPercentage,
      taxAmount: actualTaxAmount,
      discountPercentage: watchedDiscountPercentage,
      discountAmount: actualDiscountAmount,
      total: actualTotal,
    }

    await generateQuotationPdf(payload)
    toast.success('Quotation PDF downloaded.')
  }

  const addRow = () => {
    if (!includeLineItems) return
    append(initialLineItem(), { shouldFocus: false })
    window.requestAnimationFrame(() => {
      const nextIndex = fields.length
      const nextInput = document.querySelector<HTMLInputElement>(`[data-line-item-row="${nextIndex}"] input`)
      nextInput?.focus()
    })
  }

  const onSubmit = async (values: QuotationFormData) => {
    const saveCompanyId = quotation?.companyId ?? selectedCompany ?? currentCompany?.id
    if (!saveCompanyId) {
      toast.error('Please select a company before saving this quotation.')
      return
    }

    const normalizedItems: StoreLineItem[] = includeLineItems
      ? (values.lineItems ?? []).map((item, index) => ({
          id: `${Date.now()}-${index}`,
          type: item.type === 'service' ? 'labour' : 'parts',
          description: item.description,
          quantity: Number(item.qty ?? 0),
          unitPrice: Number(item.unitPrice ?? 0),
          total: roundMoney(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0)),
        }))
      : []

    const apiPayload = {
      quotation_number: values.quotationNumber,
      company_id: saveCompanyId,
      vehicle_id: values.vehicleId,
      mileage: Number(values.mileage ?? 0),
      note: values.note,
      quotation_status: values.status,
      subtotal: includeLineItems ? subtotal : 0,
      discount: includeLineItems ? discountAmount : 0,
      discount_percentage: includeLineItems ? values.discountPercentage : 0,
      tax_amount: includeLineItems ? taxAmount : 0,
      tax_percentage: includeLineItems ? values.taxPercentage : 0,
      total: includeLineItems ? total : 0,
      creation_date: values.creationDate,
      created_by: user?.id,
      status: 1,
      ...(includeLineItems
        ? {
            details: normalizedItems.map((item) => ({
              type: item.type === 'labour' ? 'service' : 'parts',
              description: item.description,
              qty: item.quantity,
              unit_price: item.unitPrice,
              discount: 0,
              tax: 0,
              status: 1,
              is_deleted: 0,
            })),
          }
        // Sending an empty list on edit tells the API to soft-delete old details.
        : mode === 'edit' ? { details: [] } : {}),
    }

    const formData = new FormData()
    Object.entries(apiPayload).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''))
    })
    documentFiles.forEach((file) => formData.append('documents', file))

    try {
      const response = await fetch(`/backend-api/quotations${mode === 'edit' && quotationId ? `/${quotationId}` : ''}`, {
        method: mode === 'edit' && quotationId ? 'PUT' : 'POST',
        // Let the browser supply the multipart boundary. Multer receives files
        // under the field name expected by the quotation routes: "documents".
        body: formData,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to save quotation.')
      }
      toast.success(`Quotation ${mode === 'edit' ? 'updated' : 'created'} successfully.`)
      router.push(`/quotations?vehicle_id=${encodeURIComponent(String(values.vehicleId))}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save quotation.')
    }
  }

  if (mode === 'edit' && isQuotationLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">Loading quotation...</div>
  }

  if (mode === 'edit' && quotationId && !quotation) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          title="Quotation not found"
          description="We could not find the quotation you were trying to edit."
          action={{
            label: 'Back to Quotations',
            onClick: () => router.push('/quotations'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Hidden Print View */}
      <QuotationPrintView
        companyName={companyName}
        companyEmail={companyEmail}
        companyCountry={companyCountry}
        companyPhone={companyPhone}
        companyAddress={companyAddress}
        companyRegNo={companyRegNo}
        companyLogoUrl={companyLogoUrl}
        quotationNumber={watch('quotationNumber') || ''}
        creationDate={watch('creationDate') || ''}
        note={watch('note') || ''}
        customerName={customerDisplayName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        vehicleMake={vehicleMake}
        vehicleModel={vehicleModel}
        vehicleYear={vehicleYear}
        vin={vehicleVin}
        licensePlate={vehicleLicensePlate}
        includeLineItems={includeLineItems}
        lineItems={watchedLineItems}
        subtotal={subtotal}
        taxPercentage={watchedTaxPercentage}
        taxAmount={taxAmount}
        discountPercentage={watchedDiscountPercentage}
        discountAmount={discountAmount}
        total={total}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-3xl border border-border bg-card shadow-sm">
          {/* Header with Company details */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-bold text-primary ring-1 ring-border">
                  {companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={companyLogoUrl} alt={companyName} className="size-full object-cover" />
                  ) : (
                    companyInitials
                  )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{companyName}</h1>
                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
                    <p><span className="font-semibold text-foreground">Email:</span> {companyEmail}</p>
                    <p><span className="font-semibold text-foreground">Country:</span> {companyCountry}</p>
                    <p><span className="font-semibold text-foreground">Phone:</span> {companyPhone}</p>
                    <p><span className="font-semibold text-foreground">Reg No:</span> {companyRegNo}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-foreground">Address:</span> {companyAddress}</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-2 sm:pt-1">
                <Label htmlFor="creationDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="creationDate"
                  type="date"
                  {...register('creationDate')}
                  className={cn(errors.creationDate && 'border-destructive')}
                />
                {errors.creationDate && (
                  <p className="text-xs font-medium text-destructive">{errors.creationDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Details */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Customer Detail</h2>
                    <p className="text-xs text-muted-foreground">Linked record details</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground pt-1">
                  <p><span className="text-muted-foreground">Name: </span><span className="font-medium">{customerDisplayName}</span></p>
                  <p><span className="text-muted-foreground">Email: </span><span>{customerEmail}</span></p>
                  <p><span className="text-muted-foreground">Phone: </span><span>{customerPhone}</span></p>
                  <p><span className="text-muted-foreground">Address: </span><span>{customerAddress}</span></p>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Vehicle Detail</h2>
                    <p className="text-xs text-muted-foreground">Linked record details</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground pt-1">
                  <p><span className="text-muted-foreground">Make: </span><span>{vehicleMake}</span></p>
                  <p><span className="text-muted-foreground">Model: </span><span>{vehicleModel}</span></p>
                  
                  <p><span className="text-muted-foreground">Year: </span><span>{vehicleYear}</span></p>
                  <p><span className="text-muted-foreground">VIN: </span><span>{vehicleVin}</span></p>
                  <p><span className="text-muted-foreground">License Plate: </span><span>{vehicleLicensePlate}</span></p>
                  <p><span className="text-muted-foreground">Insured: </span><span>{vehicleInsured}</span></p>
                </div>
              </section>
            </div>
          </div>

          {/* Quotation Core Details */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Quotation Details</h2>
                <p className="text-sm text-muted-foreground">Core quotation information and attached document.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setValue('quotationNumber', `QT-${Date.now()}`, { shouldDirty: true })}>
                <Edit3 className="size-4" />
                Generate Number
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input
                  id="quotationNumber"
                  placeholder="QT-0001"
                  {...register('quotationNumber')}
                  className={cn(errors.quotationNumber && 'border-destructive')}
                />
                {errors.quotationNumber && <p className="text-xs font-medium text-destructive">{errors.quotationNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('mileage', { valueAsNumber: true })}
                  className={cn(errors.mileage && 'border-destructive')}
                />
                {errors.mileage && <p className="text-xs font-medium text-destructive">{errors.mileage.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Quotation Status</Label>
                <Select
                  value={watch('status') ?? 'draft'}
                  onValueChange={(value) => setValue('status', value as QuotationFormData['status'], { shouldDirty: true, shouldValidate: true })}
                >
                  <SelectTrigger className={cn('w-full', errors.status && 'border-destructive')}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs font-medium text-destructive">{errors.status.message}</p>}
              </div>

              {/* Multi-file Document Upload */}
              <div className="space-y-3 md:col-span-2">
                <Label>Document Upload</Label>
                <label
                  htmlFor="multi-file-input"
                  className="flex min-h-[110px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:border-primary hover:bg-muted/40 transition-colors"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-1.5">
                    <Upload className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Click or drag & drop files to upload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Supports PDF, DOC, DOCX, PNG, JPG (Multiple files supported)</p>
                  <input
                    id="multi-file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? [])
                      if (files.length > 0) {
                        const names = files.map((f) => f.name)
                        setUploadedFiles((prev) => Array.from(new Set([...prev, ...names])))
                        setDocumentFiles((prev) => [...prev, ...files])
                      }
                    }}
                  />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Attached Documents ({uploadedFiles.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((fileName, idx) => {
                        // Persisted documents use their API URL; selected files use
                        // a temporary browser URL until the quotation is saved.
                        const documentUrl = quotation?.documents?.find((document: any) => document.document === fileName)?.url
                        const selectedFile = documentFiles.find((file) => file.name === fileName)
                        return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                        >
                          <FileText className="size-4 text-primary shrink-0" />
                          <span className="max-w-[220px] truncate">{fileName}</span>
                          {(documentUrl || selectedFile) && (
                            <button
                              type="button"
                              onClick={() => {
                                const url = documentUrl ?? URL.createObjectURL(selectedFile!)
                                window.open(url, '_blank', 'noopener,noreferrer')
                              }}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                              aria-label={`View ${fileName} in a new tab`}
                            >
                              <Eye className="size-3.5" />
                              View
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const removedName = fileName
                              setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
                              setDocumentFiles((prev) => {
                                const fileIndex = prev.findIndex((file) => file.name === removedName)
                                return fileIndex < 0 ? prev : prev.filter((_, i) => i !== fileIndex)
                              })
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            aria-label={`Remove ${fileName}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  rows={4}
                  placeholder="Add quotation notes here..."
                  {...register('note')}
                  className={cn(errors.note && 'border-destructive')}
                />
                {errors.note && <p className="text-xs font-medium text-destructive">{errors.note.message}</p>}
              </div>
            </div>
          </div>

          {/* Line Items & Summary with Toggle */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
                <p className="text-sm text-muted-foreground">Edit rows directly without a modal.</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeLineItems}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const nextValue = !includeLineItems
                    setIncludeLineItems(nextValue)
                    if (nextValue && fields.length === 0) {
                      append(initialLineItem(), { shouldFocus: false })
                    }
                    if (!nextValue) {
                      // Do not validate or submit detail rows while this section is off.
                      replace([])
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-border bg-muted/20 px-3.5 py-2 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">Include Line Items</span>
                  <div
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all",
                      includeLineItems ? "bg-primary after:translate-x-5" : "bg-slate-300"
                    )}
                  />
                </button>

                <Button
                  type="button"
                  onClick={addRow}
                  disabled={!includeLineItems}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Add New
                </Button>
              </div>
            </div>

            <div className={cn("transition-all duration-200", !includeLineItems && "opacity-50 pointer-events-none select-none")}>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
                <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="w-36 px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="w-24 px-4 py-3 font-semibold">Qty</th>
                      <th className="w-36 px-4 py-3 font-semibold">Unit Price</th>
                      <th className="w-36 px-4 py-3 font-semibold">Amount</th>
                      <th className="w-24 px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {fields.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          Add at least one line item to continue.
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, index) => {
                        const rowAmount = roundMoney(Number(watchedLineItems[index]?.qty ?? 0) * Number(watchedLineItems[index]?.unitPrice ?? 0))
                        return (
                          <tr key={field.id} data-line-item-row={index} className="align-top">
                            <td className="px-4 py-4">
                              <Select
                                disabled={!includeLineItems}
                                value={watch(`lineItems.${index}.type`) ?? 'service'}
                                onValueChange={(value) =>
                                  setValue(`lineItems.${index}.type`, value as 'service' | 'parts', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="service">Service</SelectItem>
                                  <SelectItem value="parts">Parts</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                disabled={!includeLineItems}
                                {...register(`lineItems.${index}.description` as const)}
                                placeholder="Describe the work or part"
                                className={cn(errors.lineItems?.[index]?.description && 'border-destructive')}
                              />
                              {errors.lineItems?.[index]?.description && (
                                <p className="mt-1 text-xs font-medium text-destructive">
                                  {errors.lineItems?.[index]?.description?.message}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                type="number"
                                min={0}
                                disabled={!includeLineItems}
                                {...register(`lineItems.${index}.qty` as const, { valueAsNumber: true })}
                                className={cn(errors.lineItems?.[index]?.qty && 'border-destructive')}
                              />
                              {errors.lineItems?.[index]?.qty && (
                                <p className="mt-1 text-xs font-medium text-destructive">
                                  {errors.lineItems?.[index]?.qty?.message}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                disabled={!includeLineItems}
                                {...register(`lineItems.${index}.unitPrice` as const, { valueAsNumber: true })}
                                className={cn(errors.lineItems?.[index]?.unitPrice && 'border-destructive')}
                              />
                              {errors.lineItems?.[index]?.unitPrice && (
                                <p className="mt-1 text-xs font-medium text-destructive">
                                  {errors.lineItems?.[index]?.unitPrice?.message}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                value={formatMoney(includeLineItems ? rowAmount : 0)}
                                readOnly
                                className="bg-muted/50 font-semibold text-foreground"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={!includeLineItems}
                                  onClick={() => {
                                    if (!includeLineItems) return
                                    const current = watch(`lineItems.${index}`)
                                    update(index, {
                                      ...current,
                                      amount: rowAmount,
                                    })
                                  }}
                                  aria-label={`Edit row ${index + 1}`}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={!includeLineItems}
                                  onClick={() => includeLineItems && remove(index)}
                                  aria-label={`Delete row ${index + 1}`}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-border/70 p-5 sm:p-6">
                <div className="ml-auto grid w-full max-w-xl gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-semibold text-foreground">{formatMoney(subtotal)}</span>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="taxPercentage" className="text-sm font-medium text-foreground">
                        Tax
                      </Label>
                      <span className="text-sm font-semibold text-foreground">{formatMoney(taxAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="taxPercentage"
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        disabled={!includeLineItems}
                        {...register('taxPercentage', { valueAsNumber: true })}
                        className={cn('w-28', errors.taxPercentage && 'border-destructive')}
                      />
                      <span className="text-sm text-muted-foreground">% Tax</span>
                    </div>
                    {errors.taxPercentage && <p className="text-xs font-medium text-destructive">{errors.taxPercentage.message}</p>}
                  </div>

                  <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="discountPercentage" className="text-sm font-medium text-foreground">
                        Discount
                      </Label>
                      <span className="text-sm font-semibold text-foreground">{formatMoney(discountAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="discountPercentage"
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        disabled={!includeLineItems}
                        {...register('discountPercentage', { valueAsNumber: true })}
                        className={cn('w-28', errors.discountPercentage && 'border-destructive')}
                      />
                      <span className="text-sm text-muted-foreground">% Discount</span>
                    </div>
                    {errors.discountPercentage && (
                      <p className="text-xs font-medium text-destructive">{errors.discountPercentage.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-primary/5 px-4 py-4">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 px-5 py-4 sm:px-6 no-print">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/quotations')}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={handleDownloadPdf}>
                <Download className="size-4" />
                Download PDF
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Quotation' : 'Create Quotation'}
              </Button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
