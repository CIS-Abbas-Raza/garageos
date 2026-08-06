'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Plus, Search, Trash2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useGarageStore } from '@/lib/store/garage-store'

type Field = { key: string; label: string; type?: 'text' | 'email' | 'number' | 'date' | 'select'; options?: string[]; required?: boolean }
type Config = { resource: string; title: string; description: string; fields: Field[]; columns: string[]; empty: string }

const labelize = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())

export function EntityCrudPage({ config }: { config: Config }) {
  const store = useGarageStore() as any
  const rows = (store[config.resource] ?? []) as Record<string, any>[]
  const add = store[`add${config.resource[0].toUpperCase()}${config.resource.slice(1, -1)}`] ?? store[`add${config.resource[0].toUpperCase()}${config.resource.slice(1)}`]
  const update = store[`update${config.resource[0].toUpperCase()}${config.resource.slice(1, -1)}`] ?? store[`update${config.resource[0].toUpperCase()}${config.resource.slice(1)}`]
  const remove = store[`delete${config.resource[0].toUpperCase()}${config.resource.slice(1, -1)}`] ?? store[`delete${config.resource[0].toUpperCase()}${config.resource.slice(1)}`]
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Record<string, any> | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  const openCreate = () => { setEditing(null); setForm({}); setIsFormOpen(true) }
  const openEdit = (row: Record<string, any>) => { setEditing(row); setForm(row); setIsFormOpen(true) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const payload = { ...form }
    for (const field of config.fields) if (field.type === 'number' && payload[field.key] !== '') payload[field.key] = Number(payload[field.key])
    if (editing && update) update(editing.id, payload)
    else if (add) add(payload)
    else { toast.error(`Connect ${config.title} to a store action first.`); return }
    toast.success(`${config.title.slice(0, -1)} ${editing ? 'updated' : 'created'} successfully`)
    setForm({}); setEditing(null); setIsFormOpen(false)
  }
  const closeForm = () => { setEditing(null); setForm({}); setIsFormOpen(false) }
  const title = editing ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`

  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><DashboardHeader title={config.title} /><main className="flex-1 overflow-y-auto p-6 lg:p-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-primary">Operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{config.title}</h1><p className="mt-2 text-muted-foreground">{config.description}</p></div><button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Add {config.title.slice(0, -1)}</button></div>
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>
      {isFormOpen ? <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={() => { setEditing(null); setForm({}) }} aria-label="Close form"><X className="size-5 text-muted-foreground" /></button></div><div className="grid gap-4 md:grid-cols-2">{config.fields.map((field) => <label key={field.key} className="flex flex-col gap-2 text-sm font-medium">{field.label}{field.type === 'select' ? <select required={field.required} value={form[field.key] ?? ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary"> <option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input required={field.required} type={field.type ?? 'text'} value={form[field.key] ?? ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary" />}</label>)}</div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => { setEditing(null); setForm({}) }} className="rounded-lg border border-border px-4 py-2 text-sm font-medium">Cancel</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save changes</button></div></form> : null}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border bg-muted/40"><tr>{config.columns.map((column) => <th key={column} className="px-5 py-4 font-semibold">{labelize(column)}</th>)}<th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((row) => <tr key={row.id} className="hover:bg-muted/30">{config.columns.map((column) => <td key={column} className="px-5 py-4">{row[column] instanceof Date ? row[column].toLocaleDateString() : String(row[column] ?? '—')}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(row)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit"><Pencil className="size-4" /></button>{remove && <button type="button" onClick={() => { if (window.confirm(`Delete this ${config.title.slice(0, -1).toLowerCase()}?`)) { remove(row.id); toast.success('Deleted successfully') } }} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="size-4" /></button>}</div></td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="p-12 text-center"><p className="font-medium">{config.empty}</p><p className="mt-2 text-sm text-muted-foreground">Create your first record to get started.</p></div>}</div></div></main></div></div>
}
