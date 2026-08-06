'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function CommunicationSettingsPage() {
  const [enabled, setEnabled] = useState({ email: true, sms: false, whatsapp: false })
  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title="Communication Settings" /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-semibold tracking-tight">Communication Settings</h1><p className="mt-2 text-muted-foreground">Configure message channels and templates. Sending is disabled in this demo workspace.</p><div className="mt-8 grid gap-4">{Object.entries(enabled).map(([channel, value]) => <div key={channel} className="flex items-center justify-between rounded-2xl border border-border bg-card p-6"><div><h2 className="font-semibold capitalize">{channel} notifications</h2><p className="mt-1 text-sm text-muted-foreground">Appointment reminders and invoice updates.</p></div><button type="button" onClick={() => setEnabled({ ...enabled, [channel]: !value })} className={`rounded-full px-4 py-2 text-sm font-semibold ${value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{value ? 'Enabled' : 'Disabled'}</button></div>)}</div><button onClick={() => toast.success('Communication settings saved')} className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save settings</button></div></main></div></div>
}
