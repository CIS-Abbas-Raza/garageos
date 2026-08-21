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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGarageStore } from '@/lib/store/garage-store'
import type { Invoice, Payment } from '@/lib/types/store'

type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online'
type PaymentStatus = 'pending' | 'not_verified' | 'verified' | 'rejected'

type InvoicePaymentDialogProps = {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the payment slip.'))
    reader.readAsDataURL(file)
  })

export function InvoicePaymentDialog({ invoice, open, onOpenChange }: InvoicePaymentDialogProps) {
  const addPayment = useGarageStore((store) => store.addPayment)
  const [step, setStep] = useState<'method' | 'form'>('method')
  const [methodGroup, setMethodGroup] = useState<'cash' | 'online'>('cash')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [paidAmount, setPaidAmount] = useState('')
  const [picture, setPicture] = useState('')
  const [pictureError, setPictureError] = useState('')

  const totalAmount = Number(invoice?.total ?? 0)
  const currentPaid = Number(invoice?.amountPaid ?? 0)
  const balanceBeforePayment = Math.max(0, totalAmount - currentPaid)
  const paidValue = Number(paidAmount || 0)
  const balanceAmount = Math.max(0, balanceBeforePayment - paidValue)
  const isOnline = paymentMethod !== 'cash'

  useEffect(() => {
    if (!open || !invoice) return
    setStep('method')
    setMethodGroup('cash')
    setPaymentMethod('cash')
    setPaymentStatus('pending')
    setPaidAmount(String(balanceBeforePayment))
    setPicture('')
    setPictureError('')
  }, [open, invoice, balanceBeforePayment])

  const selectMethodGroup = (value: 'cash' | 'online') => {
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
      setPicture(await readFileAsDataUrl(file))
      setPictureError('')
    } catch {
      setPictureError('Unable to read the payment slip.')
    }
  }

  const handleSubmit = () => {
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

    const payment: Omit<Payment, 'id' | 'createdAt'> = {
      invoiceId: invoice.id,
      amount: paidValue,
      totalAmount,
      balanceAmount,
      paidAmount: paidValue,
      paymentMethod,
      paymentStatus,
      picture: picture || undefined,
    }
    addPayment(payment)
    toast.success('Invoice payment created successfully.')
    onOpenChange(false)
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
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${methodGroup === value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:bg-muted/40'}`}
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
              <DialogDescription>Record a payment for invoice {invoice?.invoiceNumber ?? invoice?.id}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-invoice-id">Invoice ID</Label>
                <Input id="payment-invoice-id" value={invoice?.id ?? ''} readOnly />
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
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment status <span className="text-destructive">*</span></Label>
                <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_verified">Not Verified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
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
                  <span className="truncate text-xs text-muted-foreground">{picture ? 'Slip attached' : 'JPEG, PNG, or WebP'}</span>
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