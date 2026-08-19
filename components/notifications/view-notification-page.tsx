'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'

export function ViewNotificationPage({ notificationId }: { notificationId: string }) {
  const router = useRouter()
  const notification = useGarageStore((state) => state.notifications.find((item) => item.id === notificationId))
  if (!notification) return <div className="p-8">Notification not found.</div>
  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Button variant="ghost" onClick={() => router.push('/notifications')}><ArrowLeft className="size-4" /> Notifications</Button><article className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Notification</p><h1 className="mt-2 text-2xl font-bold">{notification.title}</h1><p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{notification.message}</p><p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Created {new Date(notification.createdAt).toLocaleString()}</p></article></div>
}