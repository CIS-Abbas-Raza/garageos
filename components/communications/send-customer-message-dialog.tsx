'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type CommunicationChannel = 'sms' | 'email' | 'whatsapp'

type Props = {
  channel: CommunicationChannel | null
  companyId?: string | number
  customerId?: string | number
  documentLabel?: string
  onOpenChange: (open: boolean) => void
}

const channelLabels: Record<CommunicationChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

export function SendCustomerMessageDialog({ channel, companyId, customerId, documentLabel, onOpenChange }: Props) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const label = channel ? channelLabels[channel] : 'Message'

  const close = () => {
    setSubject('')
    setMessage('')
    onOpenChange(false)
  }

  const send = async () => {
    if (!channel || !companyId || !customerId || !message.trim()) return
    setIsSending(true)
    try {
      const endpoint = channel === 'sms' ? '/backend-api/sms' : channel === 'email' ? '/backend-api/email' : '/backend-api/whatsApp-sms'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: customerId,
          message: message.trim(),
          ...(channel === 'email' ? { subject: subject.trim() || `${documentLabel ?? 'Garage'} update` } : {}),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.error || result.message || `Unable to send ${label}.`)
      toast.success(`${label} sent successfully.`)
      close()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to send ${label}.`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={Boolean(channel)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send {label}</DialogTitle>
          <DialogDescription>Send a message to this customer about {documentLabel ?? 'this record'}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {channel === 'email' && <div className="space-y-2"><Label htmlFor="message-subject">Subject</Label><Input id="message-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={`${documentLabel ?? 'Garage'} update`} /></div>}
          <div className="space-y-2"><Label htmlFor="message-body">Message</Label><Textarea id="message-body" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message..." rows={5} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="button" onClick={send} disabled={isSending || !message.trim()}>{isSending ? 'Sending...' : `Send ${label}`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
