'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, CircleAlert, Eye, Info, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/common/confirm-delete-modal'
import { Pagination } from '@/components/common/pagination'
import { RecordCountBadges } from '@/components/common/record-count-badges'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/empty-state'
import { useGarageStore } from '@/lib/store/garage-store'
import type { Notification, NotificationType, NotificationRecipientType } from '@/lib/types/store'
import { cn } from '@/lib/utils'

const typeMeta: Record<string, { label: string; className: string; icon: typeof Info }> = { info: { label: 'Info', className: 'bg-blue-500/10 text-blue-700', icon: Info }, warning: { label: 'Warning', className: 'bg-amber-500/10 text-amber-700', icon: CircleAlert }, success: { label: 'Success', className: 'bg-emerald-500/10 text-emerald-700', icon: CheckCircle2 }, error: { label: 'Error', className: 'bg-red-500/10 text-red-700', icon: AlertCircle } }
type Draft = { title: string; message: string; type: NotificationType; recipientType: NotificationRecipientType; status: 0 | 1 }
const blankDraft: Draft = { title: '', message: '', type: 'info', recipientType: 'all', status: 1 }

export function NotificationsPage() {
  const { notifications, addNotification, updateNotification, deleteNotification } = useGarageStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Notification | null>(null)
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [deleting, setDeleting] = useState<Notification | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const rows = useMemo(() => notifications.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [notifications])
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const openCreate = () => { setEditing(null); setDraft(blankDraft); setOpen(true) }
  const openEdit = (notification: Notification) => { setEditing(notification); setDraft({ title: notification.title, message: notification.message, type: notification.type as NotificationType, recipientType: notification.recipientType ?? 'all', status: notification.status ?? 1 }); setOpen(true) }
  const save = (event: React.FormEvent) => { event.preventDefault(); if (!draft.title.trim() || !draft.message.trim()) return toast.error('Title and message are required.'); const payload = { ...draft, title: draft.title.trim(), message: draft.message.trim(), reads: editing?.reads ?? [] }; if (editing) { updateNotification(editing.id, payload); toast.success('Notification updated successfully.') } else { addNotification(payload); toast.success('Notification created successfully.') }; setOpen(false) }

  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">Create and manage messages shown to users in the notification bell.</p></div><Button onClick={openCreate}><Plus className="size-4" /> Add Notification</Button></div>
    <div className="mb-5"><RecordCountBadges counts={[{ label: 'Total', value: rows.length }, { label: 'Active', value: rows.filter((row) => row.status !== 0).length, color: 'green' }, { label: 'Inactive', value: rows.filter((row) => row.status === 0).length }]} /></div>
    {rows.length === 0 ? <EmptyState title="No notifications yet" description="Create your first notification to reach users." /> : <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr>{['Title', 'Type', 'Recipient', 'Status', 'Created At', 'Actions'].map((heading) => <th key={heading} className={cn('px-5 py-4 font-semibold', heading === 'Actions' && 'text-right')}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{pageRows.map((notification) => { const meta = typeMeta[notification.type] ?? typeMeta.info; const Icon = meta.icon; return <tr key={notification.id} className="hover:bg-muted/20"><td className="max-w-[280px] px-5 py-4"><p className="truncate font-semibold">{notification.title}</p><p className="truncate text-xs text-muted-foreground">{notification.message}</p></td><td className="px-5 py-4"><span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', meta.className)}><Icon className="size-3.5" />{meta.label}</span></td><td className="px-5 py-4 text-muted-foreground">{notification.recipientType ?? 'All Users'}</td><td className="px-5 py-4"><span className="rounded-full px-3 py-1 text-xs font-semibold">{notification.status === 0 ? 'Inactive' : 'Active'}</span></td><td className="px-5 py-4 text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</td><td className="px-5 py-4 text-right"><DropdownMenu><DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Notification actions"><MoreHorizontal className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="size-4" /> View</DropdownMenuItem><DropdownMenuItem><Pencil className="size-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => setDeleting(notification)} className="gap-2 text-destructive"><Trash2 className="size-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr> })}</tbody></table></div></div>}
    <div className="mt-4 flex flex-wrap items-center justify-end gap-4"><label className="flex items-center gap-2 text-sm text-muted-foreground">Rows per page <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="h-9 rounded-lg border border-border bg-background px-2"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
    <ConfirmDeleteModal open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Delete notification?" message="Are you sure you want to delete this notification? This action cannot be undone." successMessage="Notification deleted." onConfirm={() => { if (deleting) deleteNotification(deleting.id) }} />
  </div>
}
