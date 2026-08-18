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
  Pencil,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { useBranch } from '@/lib/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { quotationSchema, type QuotationFormData } from '@/lib/schemas'
import { useGarageStore } from '@/lib/store/garage-store'
import type { Estimation, LineItem as StoreLineItem } from '@/lib/types/store'
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
const BRAND_DARK: [number, number, number] = [15, 23, 42]
const MUTED: [number, number, number] = [100, 116, 139]
const BORDER: [number, number, number] = [226, 232, 240]
const SURFACE: [number, number, number] = [248, 250, 252]

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

type QuotationPdfPayload = {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyLogoUrl?: string
  quotationNumber: string
  creationDate: string
  customerName: string
  customerPhone: string
  customerAddress: string
  vehicleName: string
  mileage: string
  vin: string
  licensePlate: string
  note: string
  lineItems: PdfQuotationLineItem[]
  subtotal: number
  taxPercentage: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  total: number
}

const generateQuotationPdf = async (payload: QuotationPdfPayload) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_MARGIN
  const contentWidth = pageWidth - margin * 2
  const dark = [0, 0, 0] as [number, number, number]
  const muted = [0, 0, 0] as [number, number, number]
  const border = [0, 0, 0] as [number, number, number]
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
    safePdfText(payload.companyAddress, ''),
    [safePdfText(payload.companyPhone, ''), safePdfText(payload.companyEmail, '')].filter(Boolean).join('  |  '),
  ].filter(Boolean)
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

  drawSection(leftColX, 'Quotation For', [
    safePdfText(payload.customerName),
    safePdfText(payload.customerPhone, '—'),
    safePdfText(payload.customerAddress, '—'),
  ])

  drawSection(rightColX, 'Vehicle Detail', [
    safePdfText(payload.vehicleName),
    `Mileage: ${safePdfText(payload.mileage, '—')}`,
    `VIN: ${safePdfText(payload.vin, '—')}`,
    `Plate: ${safePdfText(payload.licensePlate, '—')}`,
  ])

  const detailSectionHeight = 18 + 4 * 15 + 10
  y += detailSectionHeight
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 18

  const lineItemsBody = payload.lineItems.map((item) => [
    item.type === 'service' ? 'Service' : 'Parts',
    safePdfText(item.description, '—'),
    String(Number(item.qty ?? 0)),
    formatMoney(Number(item.unitPrice ?? 0)),
    formatMoney(roundMoney(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0))),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Type', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: lineItemsBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 7,
      textColor: dark,
      lineColor: border,
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 250 },
      2: { halign: 'right', cellWidth: 42 },
      3: { halign: 'right', cellWidth: 82 },
      4: { halign: 'right', cellWidth: 82 },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        data.cell.styles.fontStyle = 'bold'
      }
    },
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
    ['Subtotal', formatMoney(payload.subtotal)],
    [`Tax (${payload.taxPercentage}%)`, formatMoney(payload.taxAmount)],
    [`Discount (${payload.discountPercentage}%)`, formatMoney(payload.discountAmount)],
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
  doc.text(formatMoney(payload.total), summaryX + summaryWidth, rowY + 16, { align: 'right' })

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

  if (y + 54 > pageHeight - margin) {
    doc.addPage()
    y = margin
  }

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('This quotation is valid for 15 days from the issue date.', margin, y + 14)
  doc.line(margin, y + 42, margin + 170, y + 42)
  doc.text('Authorized Signature', margin, y + 56)
  doc.line(pageWidth - margin - 150, y + 42, pageWidth - margin, y + 42)
  doc.text(`Date: ${safePdfText(payload.creationDate)}`, pageWidth - margin - 150, y + 56)

  doc.save(`Quotation-${safePdfText(payload.quotationNumber, 'quotation').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`)
}

const initialLineItem = (): QuotationFormData['lineItems'][number] => ({
  type: 'service',
  description: '',
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
  companyLogoUrl,
  quotationNumber,
  creationDate,
  note,
  customerName,
  customerPhone,
  customerAddress,
  vehicleName,
  vin,
  licensePlate,
  lineItems,
  subtotal,
  taxPercentage,
  taxAmount,
  discountPercentage,
  discountAmount,
  total,
}: {
  companyName: string
  companyLogoUrl?: string
  quotationNumber: string
  creationDate: string
  note: string
  customerName: string
  customerPhone: string
  customerAddress: string
  vehicleName: string
  vin: string
  licensePlate: string
  lineItems: QuotationFormData['lineItems']
  subtotal: number
  taxPercentage: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  total: number
}) {
  const companyInitials =
    companyName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C'

  return (
    <div className="print-only hidden bg-white text-slate-900">
      <div className="mx-auto max-w-5xl p-8">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-lg font-bold text-slate-700">
              {companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogoUrl} alt={companyName} className="size-full object-cover" />
              ) : (
                companyInitials
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Quotation</p>
              <h1 className="text-2xl font-bold text-slate-900">Quotation {quotationNumber}</h1>
              <p className="mt-1 text-sm text-slate-600">{companyName}</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Date</p>
            <p>{creationDate}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Customer Detail</h2>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">Name</span>
                <span className="text-sm font-medium text-slate-900">{customerName || '—'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">Phone</span>
                <span className="text-sm font-medium text-slate-900">{customerPhone || '—'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">Address</span>
                <span className="text-sm font-medium text-slate-900">{customerAddress || '—'}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Vehicle Detail</h2>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">Vehicle</span>
                <span className="text-sm font-medium text-slate-900">{vehicleName || '—'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">VIN</span>
                <span className="text-sm font-medium text-slate-900">{vin || '—'}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3">
                <span className="text-sm text-slate-500">License Plate</span>
                <span className="text-sm font-medium text-slate-900">{licensePlate || '—'}</span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Quotation Details</h2>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Quotation Number</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{quotationNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Date</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{creationDate || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wider text-slate-500">Note</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">{note || '—'}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
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
                  <td className="px-4 py-3">{item.qty}</td>
                  <td className="px-4 py-3">{formatMoney(item.unitPrice)}</td>
                  <td className="px-4 py-3">{formatMoney(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 ml-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tax ({taxPercentage}%)</span>
              <span className="font-semibold text-slate-900">{formatMoney(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Discount ({discountPercentage}%)</span>
              <span className="font-semibold text-slate-900">{formatMoney(discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">{formatMoney(total)}</span>
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
  const {
    companies,
    customers,
    vehicles,
    estimations,
    settings,
    addEstimation,
    updateEstimation,
  } = useGarageStore()

  const quotation = useMemo(
    () => (mode === 'edit' && quotationId ? estimations.find((item) => item.id === quotationId) : undefined),
    [mode, quotationId, estimations],
  )

  const currentCompany = companies.find((company) => company.id === selectedCompany) ?? companies[0]
  const currentSettings = currentCompany?.id ? settings[currentCompany.id] : undefined
  const rawCompanyLogo =
    currentSettings?.logoUrl ??
    (currentCompany as { logoUrl?: string; logo?: string } | undefined)?.logoUrl ??
    (currentCompany as { logoUrl?: string; logo?: string } | undefined)?.logo
  const companyLogoUrl = isValidImageSource(rawCompanyLogo) ? rawCompanyLogo : undefined
  const companyInitials =
    currentCompany?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C'

  const defaultValues = useMemo<QuotationFormData>(() => {
    const defaultCustomerId = quotation?.customerId ?? customers[0]?.id ?? ''
    const defaultVehicle =
      quotation?.vehicleId ??
      vehicles.find((vehicle) => vehicle.customerId === defaultCustomerId)?.id ??
      vehicles[0]?.id ??
      ''

    return {
      quotationNumber: quotation?.quotationNumber ?? `QT-${Date.now()}`,
      customerId: defaultCustomerId,
      vehicleId: defaultVehicle,
      mileage: quotation?.mileage ?? 0,
      note: quotation?.note ?? quotation?.description ?? '',
      status: quotation?.quotationStatus ?? quotation?.status ?? 'draft',
      creationDate: formatDateInput(quotation?.creationDate ?? quotation?.createdAt),
      documentName: quotation?.documentName ?? '',
      taxPercentage: quotation?.taxPercentage ?? 10,
      discountPercentage: quotation?.discountPercentage ?? 0,
      subtotal: quotation?.subtotal ?? 0,
      taxAmount: quotation?.taxAmount ?? quotation?.tax ?? 0,
      discountAmount: quotation?.discountAmount ?? quotation?.discount ?? 0,
      total: quotation?.total ?? 0,
      lineItems: quotation?.lineItems?.length
        ? quotation.lineItems.map((item) => normalizeLineItem(item as any))
        : [initialLineItem()],
    }
  }, [quotation, customers, vehicles])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'lineItems',
  })

  const watchedLineItems = useWatch({ control, name: 'lineItems' }) ?? []
  const watchedCustomerId = useWatch({ control, name: 'customerId' })
  const watchedVehicleId = useWatch({ control, name: 'vehicleId' })
  const watchedTaxPercentage = Number(useWatch({ control, name: 'taxPercentage' }) ?? 0)
  const watchedDiscountPercentage = Number(useWatch({ control, name: 'discountPercentage' }) ?? 0)

  const subtotal = useMemo(
    () =>
      roundMoney(
        watchedLineItems.reduce((sum, item) => sum + Number(item?.qty ?? 0) * Number(item?.unitPrice ?? 0), 0),
      ),
    [watchedLineItems],
  )
  const taxAmount = useMemo(() => roundMoney((subtotal * watchedTaxPercentage) / 100), [subtotal, watchedTaxPercentage])
  const discountAmount = useMemo(
    () => roundMoney((subtotal * watchedDiscountPercentage) / 100),
    [subtotal, watchedDiscountPercentage],
  )
  const total = useMemo(() => roundMoney(subtotal + taxAmount - discountAmount), [subtotal, taxAmount, discountAmount])

  useEffect(() => {
    if (!watchedCustomerId && customers[0]?.id) {
      setValue('customerId', customers[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [customers, watchedCustomerId, setValue])

  const selectedCustomer = customers.find((customer) => customer.id === watchedCustomerId)
  const customerDisplayName = formatPersonName(selectedCustomer?.firstName, selectedCustomer?.lastName)
  const filteredVehicles = useMemo(
    () =>
      watchedCustomerId
        ? vehicles.filter((vehicle) => vehicle.customerId === watchedCustomerId)
        : vehicles,
    [vehicles, watchedCustomerId],
  )

  useEffect(() => {
    if (filteredVehicles.length === 0) return
    const currentVehicle = filteredVehicles.find((vehicle) => vehicle.id === watchedVehicleId)
    if (!currentVehicle) {
      setValue('vehicleId', filteredVehicles[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [filteredVehicles, watchedVehicleId, setValue])

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === watchedVehicleId)
  const vehicleDisplayName = selectedVehicle
    ? [selectedVehicle.make, selectedVehicle.model, selectedVehicle.year].filter(Boolean).join(' ')
    : '—'

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

  const [openCustomerPicker, setOpenCustomerPicker] = useState(false)
  const [openVehiclePicker, setOpenVehiclePicker] = useState(false)

  const handleDownloadPdf = async () => {
    if (!currentCompany?.id) {
      toast.error('Please select a company before downloading the quotation PDF.')
      return
    }

    const values = getValues()
    const companyName = currentCompany.name?.trim() || 'Company'
    const mileageValue = Number(values.mileage ?? quotation?.mileage ?? 0)
    const payload: QuotationPdfPayload = {
      companyName,
      companyAddress: [currentCompany.address, currentCompany.city, currentCompany.state, currentCompany.zipCode]
        .filter(Boolean)
        .join(', '),
      companyPhone: currentCompany.phone,
      companyEmail: currentCompany.email,
      companyLogoUrl,
      quotationNumber: values.quotationNumber || `QT-${Date.now()}`,
      creationDate: values.creationDate || formatDateInput(),
      customerName: customerDisplayName,
      customerPhone: selectedCustomer?.phone ?? '—',
      customerAddress: selectedCustomer?.address ?? '—',
      vehicleName: vehicleDisplayName,
      mileage: mileageValue > 0 ? `${new Intl.NumberFormat('en-US').format(mileageValue)} km` : '—',
      vin: selectedVehicle?.vin ?? '—',
      licensePlate: selectedVehicle?.licensePlate ?? '—',
      note: values.note ?? '',
      lineItems: (values.lineItems ?? []).map((item) => ({
        type: item.type,
        description: item.description,
        qty: Number(item.qty ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      })),
      subtotal,
      taxPercentage: watchedTaxPercentage,
      taxAmount,
      discountPercentage: watchedDiscountPercentage,
      discountAmount,
      total,
    }

    await generateQuotationPdf(payload)
    toast.success('Quotation PDF downloaded.')
  }

  const addRow = () => {
    append(initialLineItem(), { shouldFocus: false })
    window.requestAnimationFrame(() => {
      const nextIndex = fields.length
      const nextInput = document.querySelector<HTMLInputElement>(`[data-line-item-row="${nextIndex}"] input`)
      nextInput?.focus()
    })
  }

  const onSubmit = (values: QuotationFormData) => {
    if (!currentCompany?.id) {
      toast.error('Please select a company before saving this quotation.')
      return
    }

    const normalizedItems: StoreLineItem[] = values.lineItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      type: item.type === 'service' ? 'labour' : 'parts',
      description: item.description,
      quantity: Number(item.qty ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
      total: roundMoney(Number(item.qty ?? 0) * Number(item.unitPrice ?? 0)),
    }))

    const payload: Omit<Estimation, 'id' | 'createdAt'> = {
      companyId: currentCompany.id,
      customerId: values.customerId,
      vehicleId: values.vehicleId,
      description: values.note,
      quotationNumber: values.quotationNumber,
      mileage: values.mileage,
      note: values.note,
      creationDate: values.creationDate,
      documentName: values.documentName,
      taxPercentage: values.taxPercentage,
      discountPercentage: values.discountPercentage,
      taxAmount,
      discountAmount,
      quotationStatus: values.status,
      lineItems: normalizedItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      status: values.status,
    }

    if (mode === 'edit' && quotationId) {
      updateEstimation(quotationId, payload)
      toast.success('Quotation updated successfully.')
    } else {
      addEstimation(payload)
      toast.success('Quotation created successfully.')
    }

    router.push('/quotations')
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-3xl border border-border bg-card shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary ring-1 ring-border">
                  {companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={companyLogoUrl} alt={currentCompany?.name ?? 'Company logo'} className="size-full object-cover" />
                  ) : (
                    companyInitials
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quotation</p>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {mode === 'edit' ? 'Edit Quotation' : 'Add New Quotation'}
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground">{currentCompany?.name ?? 'Select Company'}</p>
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

          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Customer Detail</h2>
                      <p className="text-xs text-muted-foreground">Linked record details</p>
                    </div>
                  </div>
                  {mode === 'create' ? (
                    <div className="relative">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => {
                          setOpenVehiclePicker(false)
                          setOpenCustomerPicker((value) => !value)
                        }}
                      >
                        Change
                      </button>
                      {openCustomerPicker && (
                        <div className="absolute right-0 top-8 z-20 w-80 rounded-2xl border border-border bg-card p-2 shadow-xl">
                          <div className="max-h-72 overflow-y-auto">
                            {customers.map((customer) => {
                              const fullName = formatPersonName(customer.firstName, customer.lastName)
                              return (
                                <button
                                  key={customer.id}
                                  type="button"
                                  className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                                  onClick={() => {
                                    setValue('customerId', customer.id, { shouldDirty: true, shouldValidate: true })
                                    const matchingVehicle = vehicles.find((vehicle) => vehicle.customerId === customer.id)
                                    if (matchingVehicle) {
                                      setValue('vehicleId', matchingVehicle.id, { shouldDirty: true, shouldValidate: true })
                                    }
                                    setOpenCustomerPicker(false)
                                  }}
                                >
                                  {fullName}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">Read only</span>
                  )}
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground">
                  <p className="font-medium">{customerDisplayName}</p>
                  <p>{selectedCustomer?.phone ?? '—'}</p>
                  <p className="text-muted-foreground">{selectedCustomer?.address ?? '—'}</p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Truck className="size-4" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Vehicle Detail</h2>
                      <p className="text-xs text-muted-foreground">Linked record details</p>
                    </div>
                  </div>
                  {mode === 'create' ? (
                    <div className="relative">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => {
                          setOpenCustomerPicker(false)
                          setOpenVehiclePicker((value) => !value)
                        }}
                      >
                        Change
                      </button>
                      {openVehiclePicker && (
                        <div className="absolute right-0 top-8 z-20 w-80 rounded-2xl border border-border bg-card p-2 shadow-xl">
                          <div className="max-h-72 overflow-y-auto">
                            {filteredVehicles.map((vehicle) => {
                              const label = `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                              return (
                                <button
                                  key={vehicle.id}
                                  type="button"
                                  className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                                  onClick={() => {
                                    setValue('vehicleId', vehicle.id, { shouldDirty: true, shouldValidate: true })
                                    setOpenVehiclePicker(false)
                                  }}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">Read only</span>
                  )}
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground">
                  <p className="font-medium">{vehicleDisplayName}</p>
                  <p>VIN: {selectedVehicle?.vin ?? '—'}</p>
                  <p>Plate: {selectedVehicle?.licensePlate ?? '—'}</p>
                </div>
              </section>
            </div>
          </div>

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

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="documentName">Document</Label>
                <Input
                  id="documentName"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    setValue('documentName', file?.name ?? '', { shouldDirty: true, shouldValidate: true })
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {watch('documentName') || 'No document selected'}
                </p>
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

          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
                <p className="text-sm text-muted-foreground">Edit rows directly without a modal.</p>
              </div>
              <Button type="button" onClick={addRow} className="gap-2">
                <Plus className="size-4" />
                Add New
              </Button>
            </div>

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
                              min={1}
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
                              value={formatMoney(rowAmount)}
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
                                onClick={() => {
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
                                onClick={() => remove(index)}
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
