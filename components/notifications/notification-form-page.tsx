'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGarageStore } from '@/lib/store/garage-store'
import type { NotificationRecipientType, NotificationType } from '@/lib/types/store'

type NotificationFormPageProps = { mode: 'create' | 'edit'; notificationId?: string }

const defaults = { title: '', message: '', type: 'info' as NotificationType, recipientType: 'all' as NotificationRecipientType, recipientId: '', status: 1 as 0 | 1 }

export function NotificationFormPage({ mode, notificationId }: NotificationFormPageProps) {
  const router = useRouter()
  const { notifications, companies, employees, addNotification, updateNotification } = useGarageStore()
  const existing = notifications.find((item) => item.id === notificationId)
  const initial = useMemo(() => existing ? { title: existing.title, message: existing.message, type: existing.type === 'job' || existing.type === 'alert' || existing.type === 'payment' ? 'info' : existing.type, recipientType: existing.recipientType ?? 'all', recipientId: existing.recipientId ?? '', status: existing.status ?? 1 } : defaults, [existing])
  const [form, setForm] = useState(initial)
  useEffect(() => setForm(initial), [initial])
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }))

  if (mode === 'edit' && !existing) return <div className="mx-auto max-w-3xl px-4 py-10"><p className="text-muted-foreground">Notification not found.</p><Button className="mt-4" onClick={() => router.push('/notifications')}>Back to Notifications</Button></div>

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return toast.error('Title and message are required.')
    if (form.recipientType !== 'all' && !form.recipientId) return toast.error('Choose a recipient.')
    const payload = { title: form.title.trim(), message: form.message.trim(), type: form.type, recipientType: form.recipientType, recipientId: form.recipientType === 'all' ? undefined : form.recipientId, status: form.status, reads: existing?.reads ?? [], companyId: undefined }
    if (mode === 'edit' && notificationId) { updateNotification(notificationId, payload); toast.success('Notification updated successfully.') } else { addNotification(payload); toast.success('Notification created successfully.') }
    router.push('/notifications')
  }

  const people = employees.map((employee) => ({ id: employee.id, label: `${employee.firstName} ${employee.lastName}` }))
  return <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Button variant="ghost" className="mb-5" onClick={() => router.push('/notifications')}><ArrowLeft className="size-4" /> Notifications</Button><div className="mb-6"><p className="text-sm font-medium text-primary">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{mode === 'edit' ? 'Edit Notification' : 'Add Notification'}</h1><p className="mt-2 text-sm text-muted-foreground">Create an in-app message and choose who should receive it.</p></div><form onSubmit={save} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="notification-title">Title *</Label><Input id="notification-title" value={form.title} onChange={(event) => update('title', event.target.value)} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="notification-message">Message *</Label><Textarea id="notification-message" value={form.message} onChange={(event) => update('message', event.target.value)} rows={5} required /></div><div className="space-y-2"><Label htmlFor="notification-type">Type *</Label><select id="notification-type" value={form.type} onChange={(event) => update('type', event.target.value as NotificationType)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option></select></div><div className="space-y-2"><Label htmlFor="notification-status">Status *</Label><select id="notification-status" value={form.status} onChange={(event) => update('status', Number(event.target.value) as 0 | 1)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value={1}>Active</option><option value={0}>Inactive</option></select></div><div className="space-y-2"><Label htmlFor="recipient-type">Recipient *</Label><select id="recipient-type" value={form.recipientType} onChange={(event) => update('recipientType', event.target.value as NotificationRecipientType)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="all">All Users</option><option value="company">Specific Company</option><option value="user">Specific User</option></select></div>{form.recipientType !== 'all' && <div className="space-y-2"><Label htmlFor="recipient">{form.recipientType === 'company' ? 'Company *' : 'User *'}</Label><select id="recipient" value={form.recipientId} onChange={(event) => update('recipientId', event.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" required><option value="">Select recipient</option>{form.recipientType === 'company' ? companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>) : people.map((person) => <option key={person.id} value={person.id}>{person.label}</option>)}</select></div>}</div><div className="mt-6 flex justify-end border-t border-border pt-4"><Button type="submit"><Save className="size-4" /> {mode === 'edit' ? 'Save Changes' : 'Create Notification'}</Button></div></form></div>
}