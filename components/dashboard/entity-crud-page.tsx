'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Pencil, Plus, Search, Trash2, X, Eye, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useGarageStore } from '@/lib/store/garage-store'

type Field = {
  key: string
  label: string
  type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  options?: string[]
  required?: boolean
}

type Config = {
  resource: string
  title: string
  description: string
  fields: Field[]
  columns: string[]
  empty: string
}

const labelize = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())
const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive'
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.includes('T')) return new Date(value).toLocaleDateString()
  return String(value)
}

export function EntityCrudPage({ config }: { config: Config }) {
  const store = useGarageStore()
  const singular = config.resource.endsWith('ies') ? config.resource.replace(/ies$/, 'y') : config.resource.endsWith('s') ? config.resource.slice(0, -1) : config.resource
  const resourceName = singular.charAt(0).toUpperCase() + singular.slice(1)
  const hasTypedResource = Array.isArray((store as any)[config.resource])
  const rows = (hasTypedResource ? (store as any)[config.resource] : (store as any).crudRecords?.[config.resource] ?? []) as Record<string, any>[]
  const add = hasTypedResource ? (store as any)[`add${resourceName}`] : (record: Record<string, any>) => (store as any).addCrudRecord(config.resource, record)
  const update = hasTypedResource ? (store as any)[`update${resourceName}`] : (id: string, data: Record<string, any>) => (store as any).updateCrudRecord(config.resource, id, data)
  const remove = hasTypedResource ? (store as any)[`delete${resourceName}`] : (id: string) => (store as any).deleteCrudRecord(config.resource, id)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [editing, setEditing] = useState<Record<string, any> | null>(null)
  const [viewing, setViewing] = useState<Record<string, any> | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState(config.columns[0])
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    if (rows.length > 0) return
    const seed = (index: number) => Object.fromEntries(config.fields.map((field) => [field.key, field.type === 'number' ? index * 10 : field.type === 'checkbox' ? true : field.type === 'select' ? field.options?.[0] ?? 'Active' : field.type === 'date' ? new Date().toISOString().slice(0, 10) : `${field.label} ${index}`]))
    for (let index = 1; index <= 2; index += 1) add(seed(index))
  }, [add, config, rows.length])

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = JSON.stringify(row).toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'all' || String(row.status ?? (row.active === false ? 'inactive' : 'active')) === status
    return matchesQuery && matchesStatus
  }).sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? '')) * (sortAsc ? 1 : -1)), [rows, query, status, sortKey, sortAsc])

  const openCreate = () => { setEditing(null); setForm({}); setIsFormOpen(true); setMenuId(null) }
  const openEdit = (row: Record<string, any>) => { setEditing(row); setForm({ ...row }); setIsFormOpen(true); setMenuId(null) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const payload = { ...form }
    for (const field of config.fields) {
      if (field.type === 'number' && payload[field.key] !== '') payload[field.key] = Number(payload[field.key])
      if (field.type === 'checkbox') payload[field.key] = Boolean(payload[field.key])
    }
    if (editing && update) update(editing.id, payload)
    else if (!editing && add) add(payload)
    else { toast.error(`This module is not connected to a store action yet.`); return }
    toast.success(`${singular} ${editing ? 'updated' : 'created'} successfully`)
    setIsFormOpen(false); setEditing(null); setForm({})
  }
  const closeForm = () => { setEditing(null); setForm({}); setIsFormOpen(false) }

  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title={config.title} /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-primary">Operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{config.title}</h1><p className="mt-2 text-muted-foreground">{config.description}</p></div><button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Add {singular}</button></div>
    <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row"><div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" /></div><div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-muted-foreground" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="draft">Draft</option><option value="paid">Paid</option><option value="pending">Pending</option></select></div></div>
    {isFormOpen && <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">{editing ? `Edit ${singular}` : `Add ${singular}`}</h2><p className="mt-1 text-sm text-muted-foreground">Enter the details below.</p></div><button type="button" onClick={closeForm} aria-label="Close form" className="rounded-md p-2 hover:bg-muted"><X className="size-5 text-muted-foreground" /></button></div><form onSubmit={submit}><div className="grid gap-4 md:grid-cols-2">{config.fields.map((field) => <label key={field.key} className="flex flex-col gap-2 text-sm font-medium">{field.label}{field.type === 'select' ? <select required={field.required} value={form[field.key] ?? ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary"><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'textarea' ? <textarea required={field.required} value={form[field.key] ?? ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="min-h-24 rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary" /> : field.type === 'checkbox' ? <span className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 font-normal"><input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => setForm({ ...form, [field.key]: event.target.checked })} />Active</span> : <input required={field.required} type={field.type ?? 'text'} value={form[field.key] ?? ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary" />}</label>)}</div><div className="mt-6 flex justify-end gap-3 border-t border-border pt-5"><button type="button" onClick={closeForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium">Cancel</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{editing ? 'Update' : 'Create'} {singular}</button></div></form></div>}
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/40"><tr>{config.columns.map((column) => <th key={column} className="px-5 py-4 font-semibold"><button type="button" onClick={() => { setSortKey(column); setSortAsc(sortKey === column ? !sortAsc : true) }} className="inline-flex items-center gap-2">{labelize(column)}<ArrowUpDown className="size-3.5 text-muted-foreground" /></button></th>)}<th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((row) => <tr key={row.id} className="hover:bg-muted/30">{config.columns.map((column) => <td key={column} className="px-5 py-4">{column === 'status' || column === 'active' ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{formatValue(row[column])}</span> : formatValue(row[column])}</td>)}<td className="relative px-5 py-4 text-right"><button type="button" onClick={() => setMenuId(menuId === row.id ? null : row.id)} className="rounded-md p-2 hover:bg-muted" aria-label="Row actions"><MoreHorizontal className="size-4" /></button>{menuId === row.id && <div className="absolute right-5 top-12 z-20 w-40 rounded-lg border border-border bg-popover p-1 text-left shadow-lg"><button type="button" onClick={() => { setViewing(row); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"><Eye className="size-4" />View</button><button type="button" onClick={() => openEdit(row)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"><Pencil className="size-4" />Edit</button>{remove && <button type="button" onClick={() => { if (window.confirm(`Delete this ${singular.toLowerCase()}?`)) { remove(row.id); setMenuId(null); toast.success(`${singular} deleted successfully`) } }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="size-4" />Delete</button>}</div>}</td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="p-12 text-center"><p className="font-medium">{config.empty}</p><p className="mt-2 text-sm text-muted-foreground">Create your first record to get started.</p></div>}</div>
    {viewing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && setViewing(null)}><div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">{singular} details</h2><p className="mt-1 text-sm text-muted-foreground">Viewing record information.</p></div><button type="button" onClick={() => setViewing(null)} className="rounded-md p-2 hover:bg-muted" aria-label="Close details"><X className="size-5" /></button></div><div className="mt-6 grid gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">{config.fields.map((field) => <div key={field.key}><p className="text-sm text-muted-foreground">{field.label}</p><p className="mt-1 font-medium">{formatValue(viewing[field.key])}</p></div>)}<div><p className="text-sm text-muted-foreground">Created</p><p className="mt-1 font-medium">{formatValue(viewing.createdAt)}</p></div></div></div></div>}
  </div></main></div></div>
}
