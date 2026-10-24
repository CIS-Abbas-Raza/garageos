'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Bell, CheckCheck } from 'lucide-react'

interface UserNotification {
  id: string
  text: string
  read: boolean
  createdAt: string
}

export function MyNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const notificationScope = user.roleName?.trim().toLowerCase() === 'customer' ? 'customer' : 'system'
      const response = await fetch(`/backend-api/notifications?user_id=${encodeURIComponent(user.id)}&scope=${notificationScope}`)
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load notifications.')
      const rows = Array.isArray(result.data) ? result.data : []
      setNotifications(rows.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        text: String(item.text ?? item.message ?? ''),
        read: Number(item.read) === 1 || item.read === true,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      })))
    } catch {
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, user?.roleName])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
    try {
      const response = await fetch(`/backend-api/notifications/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: 1 }),
      })
      if (!response.ok) throw new Error('Unable to update notification.')
    } catch {
      void loadNotifications()
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    try {
      const response = await fetch('/backend-api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          scope: user.roleName?.trim().toLowerCase() === 'customer' ? 'customer' : 'system',
        }),
      })
      if (!response.ok) throw new Error('Unable to update notifications.')
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    } catch {
      void loadNotifications()
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-primary">Inbox</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">My Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">All notifications for your account.</p>
      </div>
      {unreadCount > 0 && <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" onClick={() => void markAllAsRead()}><CheckCheck className="size-4" /> Mark all as read</button>}
    </div>
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {isLoading ? <p className="p-10 text-center text-sm text-muted-foreground">Loading notifications...</p>
        : notifications.length === 0 ? <div className="p-10 text-center"><Bell className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">You are all caught up</p></div>
          : <div className="divide-y divide-border">{notifications.map((notification) => <button type="button" key={notification.id} onClick={() => !notification.read && void markAsRead(notification.id)} className={`flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/30 ${!notification.read ? 'bg-primary/[0.03]' : ''}`}><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><span className={`text-sm ${!notification.read ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>{notification.text}</span><span className="shrink-0 text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span></span></span>{!notification.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}</button>)}</div>}
    </div>
  </div>
}
