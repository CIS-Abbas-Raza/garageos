'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { Banknote, CreditCard, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import type { Invoice } from '@/lib/types/store'

type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online'
type InvoicePaymentDialogProps = {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentCreated?: () => void | Promise<void>
}

export function InvoicePaymentDialog({ invoice, open, onOpenChange, onPaymentCreated }: InvoicePaymentDialogProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'method' | 'form'>('method')
  const [methodGroup, setMethodGroup] = useState<'cash' | 'online'>('cash')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paidAmount, setPaidAmount] = useState('')
  const [picture, setPicture] = useState<File | null>(null)

  const invoiceNumber = invoice?.invoiceNumber ?? (invoice as Invoice & { invoice_number?: string } | null)?.invoice_number ?? invoice?.id ?? ''
  const [pictureError, setPictureError] = useState('')

  const listedBalance = (invoice as Invoice & { balance_amount?: string | number; balanceAmount?: string | number } | null)?.balance_amount
    ?? (invoice as Invoice & { balanceAmount?: string | number } | null)?.balanceAmount
  const totalAmount = Number(invoice?.total ?? 0)
  const currentPaid = Number(invoice?.amountPaid ?? 0)
  const balanceBeforePayment = Math.max(0, Number(listedBalance ?? totalAmount - currentPaid))
  const paidValue = Number(paidAmount || 0)
  const balanceAmount = Math.max(0, balanceBeforePayment - paidValue)
  const isOnline = paymentMethod !== 'cash'
  const isCustomer = user?.roles.some((role) =>
    [role.roleName, role.roleTypeName].some((value) => value?.trim().toLowerCase() === 'customer'),
  ) ?? false

  useEffect(() => {
    if (!open || !invoice) return
    setStep('method')
    setMethodGroup(isCustomer ? 'online' : 'cash')
    setPaymentMethod(isCustomer ? 'online' : 'cash')
    setPaidAmount('0')
    setPicture(null)
    setPictureError('')
  }, [open, invoice, balanceBeforePayment, isCustomer])

  const selectMethodGroup = (value: 'cash' | 'online') => {
    if (isCustomer && value === 'cash') return
    setMethodGroup(value)
    setPaymentMethod(value === 'cash' ? 'cash' : 'online')
  }

  const handlePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPictureError('Please attach an image file.')
      return
    }
    try {
      setPicture(file)
      setPictureError('')
    } catch { setPictureError('Unable to attach the payment slip.') }
  }

  const handleSubmit = async () => {
    if (!invoice) return
    if (!paidValue || paidValue <= 0) {
      toast.error('Paid amount must be greater than 0.')
      return
    }
    if (paidValue > balanceBeforePayment) {
      toast.error('Paid amount cannot exceed the remaining balance.')
      return
    }
    if (isOnline && !picture) {
      setPictureError('Payment slip is required for online payments.')
      return
    }

    const companyId = invoice.companyId ?? (invoice as Invoice & { company_id?: string | number }).company_id
    if (!companyId || !user?.id) {
      toast.error('Company and signed-in user are required to create a payment.')
      return
    }
    const paymentDoneBy = isCustomer ? 'customer' : 'company'
    const paymentStatus = isCustomer && isOnline ? 'pending' : 'verified'

    try {
      const formData = new FormData()
      formData.set('company_id', String(companyId))
      formData.set('invoice_id', String(invoice.id))
      formData.set('total_amount', String(totalAmount))
      formData.set('balance_amount', String(balanceAmount))
      formData.set('paid_amount', String(paidValue))
      formData.set('payment_method', paymentMethod)
      formData.set('payment_status', paymentStatus)
      formData.set('payment_done_by', paymentDoneBy)
      formData.set('created_by', String(user.id))
      if (picture) formData.set('picture', picture)

      const response = await fetch('/backend-api/invoice-payments', { method: 'POST', body: formData })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || result.error || 'Unable to create invoice payment.')

      await onPaymentCreated?.()
      toast.success('Invoice payment created successfully.')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create invoice payment.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === 'method' ? (
          <>
            <DialogHeader>
              <DialogTitle>Select Payment Method</DialogTitle>
              <DialogDescription>Choose how this invoice payment was received.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { value: 'cash', label: 'Cash', icon: Banknote, description: 'No slip required' },
                { value: 'online', label: 'Online', icon: CreditCard, description: 'Slip required' },
              ] as const).map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectMethodGroup(value)}
                  disabled={isCustomer && value === 'cash'}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${methodGroup === value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:bg-muted/40'} ${isCustomer && value === 'cash' ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Icon className="mt-0.5 size-5 text-primary" />
                  <span>
                    <span className="block font-semibold text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </span>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" onClick={() => setStep('form')}>Continue</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Invoice Payment</DialogTitle>
              <DialogDescription>Record a payment for invoice {invoiceNumber}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-invoice-id">Invoice number</Label>
                <Input id="payment-invoice-id" value={invoiceNumber} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-total">Total amount</Label>
                <Input id="payment-total" type="number" value={totalAmount} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-balance">Balance amount</Label>
                <Input id="payment-balance" type="number" value={balanceAmount} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-paid">Paid amount <span className="text-destructive">*</span></Label>
                <Input id="payment-paid" type="number" min="0.01" max={balanceBeforePayment} step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment method <span className="text-destructive">*</span></Label>
                <Input value={paymentMethod === 'cash' ? 'Cash' : 'Online'} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="payment-picture">
                  Payment Slip {isOnline && <span className="text-destructive">(required for online payments) *</span>}
                </Label>
                <div className="flex items-center gap-3">
                  <label htmlFor="payment-picture" className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm hover:bg-muted/40">
                    <ImagePlus className="size-4" /> Attach image
                  </label>
                  <input id="payment-picture" className="sr-only" type="file" accept="image/*" onChange={handlePictureChange} />
                  <span className="truncate text-xs text-muted-foreground">{picture ? picture.name : 'JPEG, PNG, or WebP'}</span>
                </div>
                {pictureError && <p className="text-xs font-medium text-destructive">{pictureError}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('method')}>Back</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" onClick={handleSubmit}>Create Payment</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
