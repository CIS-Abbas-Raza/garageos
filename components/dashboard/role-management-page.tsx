'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronRight, CircleX, MoreHorizontal, Pencil, Plus, Save, Search, ShieldCheck, Trash2, UserRoundCog } from 'lucide-react'
import { toast } from 'sonner'
import { useBranch } from '@/lib/branch-context'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ConfirmDeleteModal } from '@/components/common/confirm-delete-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Action = 'view' | 'create' | 'update' | 'deactivate' | 'delete'
type PermissionSet = Partial<Record<Action, boolean>>
type Role = { id: number; name: string; status?: number | string }
type SubModule = { id: number; name: string }
type Module = { id: number; name: string; subModules?: SubModule[] }

const actions: Action[] = ['view', 'create', 'update', 'deactivate', 'delete']
const reservedRoleNames = new Set(['owner', 'customer'])
const isReservedRoleName = (name: string) => reservedRoleNames.has(name.trim().toLowerCase())
const lockedModuleActions: Record<string, Action[]> = {
  sales: ['create', 'update', 'deactivate', 'delete'],
  'company account': ['create', 'update', 'deactivate', 'delete'],
  'account ledger': ['update', 'deactivate', 'delete'],
  'all invoices': ['create', 'deactivate', 'delete'],
  'invoice payments': ['create', 'deactivate', 'delete'],
  'task cards': ['deactivate'],
  'customer review': ['create', 'update', 'deactivate', 'delete'],
  'all vehicles': ['create', 'update', 'deactivate', 'delete'],
  'assigned tasks': ['create', 'deactivate', 'delete'],
  'communication logs': ['create', 'update', 'deactivate', 'delete'],
  'profile setting': ['view', 'create', 'update', 'deactivate', 'delete'],
  notifications: ['view', 'create', 'update', 'deactivate', 'delete'],
  'online payment': ['update', 'deactivate', 'delete'],
  'cash payment': ['update', 'deactivate', 'delete'],
}
const lockedModuleEnabledActions: Record<string, Action[]> = {
  'profile setting': ['view', 'create', 'update', 'deactivate', 'delete'],
  notifications: ['view', 'create', 'update', 'deactivate', 'delete'],
}

const getLockedModuleActions = (name: string) => lockedModuleActions[name.trim().toLowerCase()] ?? []

const normalizeLockedModulePermissions = (
  permissions: Record<string, PermissionSet>,
  modules: Module[],
  isCustomerRole = false,
) => {
  const normalized: Record<string, PermissionSet> = { ...permissions }
  let changed = false
  for (const subModule of modules.flatMap((module) => module.subModules ?? [])) {
    const isCustomerCashPayment = isCustomerRole && subModule.name.trim().toLowerCase() === 'cash payment'
    const actionsToLock = isCustomerCashPayment ? actions : getLockedModuleActions(subModule.name)
    if (!actionsToLock.length) continue
    const key = String(subModule.id)
    const current = normalized[key] ?? {}
    const next = { ...current }
    const enabledActions = isCustomerCashPayment ? [] : lockedModuleEnabledActions[subModule.name.trim().toLowerCase()] ?? []
    for (const action of actionsToLock) {
      const shouldBeEnabled = enabledActions.includes(action)
      if (Boolean(current[action]) !== shouldBeEnabled) changed = true
      next[action] = shouldBeEnabled
    }
    normalized[key] = next
  }
  return { permissions: normalized, changed }
}

export function RoleManagementPage() {
  const { selectedCompany } = useBranch()
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({})
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [permissionSearch, setPermissionSearch] = useState('')
  const selectedPermissionCount = Object.values(permissions).reduce(
    (total, permission) => total + actions.filter((action) => permission[action]).length,
    0,
  )
  const selectedRole = roles.find((role) => String(role.id) === selectedRoleId)
  const isCustomerRole = selectedRole?.name.trim().toLowerCase() === 'customer'
  const normalizedPermissionSearch = permissionSearch.trim().toLowerCase()
  const filteredModules = modules.map((module) => ({
    ...module,
    subModules: (module.subModules ?? []).filter((subModule) =>
      !normalizedPermissionSearch || module.name.toLowerCase().includes(normalizedPermissionSearch) || subModule.name.toLowerCase().includes(normalizedPermissionSearch),
    ),
  })).filter((module) => !normalizedPermissionSearch || module.name.toLowerCase().includes(normalizedPermissionSearch) || module.subModules.length > 0)

  const loadRoles = useCallback(async () => {
    if (!selectedCompany) {
      setRoles([])
      setSelectedRoleId('')
      return
    }
    setRolesLoading(true)
    try {
      const response = await fetch(`/backend-api/roles?company_id=${encodeURIComponent(selectedCompany)}`)
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to load roles.')
      const nextRoles = Array.isArray(body.data) ? body.data : []
      setRoles(nextRoles)
      setSelectedRoleId((current) =>
        nextRoles.some((role: Role) => String(role.id) === current)
          ? current
          : String(nextRoles[0]?.id ?? ''),
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load roles.')
    } finally {
      setRolesLoading(false)
    }
  }, [selectedCompany])

  useEffect(() => {
    if (tab === 'roles') void loadRoles()
  }, [tab, loadRoles])

  const loadRolesAndModules = useCallback(async () => {
    if (!selectedCompany) {
      setRoles([])
      setSelectedRoleId('')
      return
    }
    setLoading(true)
    try {
      const [rolesResponse, modulesResponse] = await Promise.all([
        fetch(`/backend-api/roles?company_id=${encodeURIComponent(selectedCompany)}`),
        fetch('/backend-api/modules'),
      ])
      const [rolesBody, modulesBody] = await Promise.all([rolesResponse.json(), modulesResponse.json()])
      if (!rolesResponse.ok || rolesBody.success === false) throw new Error(rolesBody.message || 'Unable to load roles.')
      if (!modulesResponse.ok || modulesBody.success === false) throw new Error(modulesBody.message || 'Unable to load modules.')
      const nextRoles = rolesBody.data ?? []
      const nextModules = modulesBody.data ?? []
      setRoles(nextRoles)
      setModules(nextModules)
      setExpandedModules(Object.fromEntries(nextModules.map((module: Module) => [module.id, true])))
      setSelectedRoleId((current) =>
        nextRoles.some((role: Role) => String(role.id) === current)
          ? current
          : String(nextRoles[0]?.id ?? ''),
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load role permissions.')
    } finally {
      setLoading(false)
    }
  }, [selectedCompany])

  useEffect(() => {
    if (tab === 'permissions') void loadRolesAndModules()
  }, [tab, loadRolesAndModules])

  useEffect(() => {
    if (!selectedCompany || !selectedRoleId) {
      setPermissions({})
      return
    }
    const loadPermissions = async () => {
      try {
        const response = await fetch(`/backend-api/roles/${selectedRoleId}/permissions?company_id=${encodeURIComponent(selectedCompany)}`)
        const body = await response.json()
        if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to load permissions.')
        const normalized = normalizeLockedModulePermissions(body.data?.permission ?? {}, modules, isCustomerRole)
        setPermissions(normalized.permissions)
        if (normalized.changed) {
          const saveResponse = await fetch(`/backend-api/roles/${selectedRoleId}/permissions?company_id=${encodeURIComponent(selectedCompany)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: normalized.permissions }),
          })
          const saveBody = await saveResponse.json()
          if (!saveResponse.ok || saveBody.success === false) throw new Error(saveBody.message || 'Unable to apply locked module permission defaults.')
          setPermissions(saveBody.data?.permission ?? normalized.permissions)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load permissions.')
      }
    }
    void loadPermissions()
  }, [isCustomerRole, modules, selectedCompany, selectedRoleId])

  const togglePermission = (subModuleId: number, action: Action, checked: boolean) => {
    if (isCustomerRole) return
    const subModule = modules.flatMap((module) => module.subModules ?? []).find((item) => item.id === subModuleId)
    if (subModule && getLockedModuleActions(subModule.name).includes(action)) return
    if (isCustomerRole && subModule?.name.trim().toLowerCase() === 'cash payment') return
    setPermissions((current) => ({
      ...current,
      [String(subModuleId)]: { ...current[String(subModuleId)], [action]: checked },
    }))
  }

  const toggleAllPermissions = (subModuleId: number, checked: boolean) => {
    if (isCustomerRole) return
    const subModule = modules.flatMap((module) => module.subModules ?? []).find((item) => item.id === subModuleId)
    if (subModule && getLockedModuleActions(subModule.name).length) return
    if (isCustomerRole && subModule?.name.trim().toLowerCase() === 'cash payment') return
    setPermissions((current) => ({
      ...current,
      [String(subModuleId)]: Object.fromEntries(actions.map((action) => [action, checked])),
    }))
  }

  const savePermissions = async () => {
    if (!selectedCompany || !selectedRoleId || isCustomerRole) return
    const normalized = normalizeLockedModulePermissions(permissions, modules, isCustomerRole)
    setSaving(true)
    try {
      const response = await fetch(`/backend-api/roles/${selectedRoleId}/permissions?company_id=${encodeURIComponent(selectedCompany)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: normalized.permissions }),
      })
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to save permissions.')
      setPermissions(body.data?.permission ?? normalized.permissions)
      toast.success('Role permissions saved successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save permissions.')
    } finally {
      setSaving(false)
    }
  }

  const openRoleDialog = (role?: Role) => {
    setEditingRole(role ?? null)
    setRoleName(role?.name ?? '')
    setRoleDialogOpen(true)
  }

  const saveRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = roleName.trim()
    if (!selectedCompany) {
      toast.error('Select a company before managing roles.')
      return
    }
    if (!name) {
      toast.error('Role name is required.')
      return
    }
    const currentRoleName = editingRole?.name.trim().toLowerCase()
    if (isReservedRoleName(name) && !isReservedRoleName(editingRole?.name ?? '')) {
      toast.error('Owner and Customer roles are created automatically and cannot be created again.')
      return
    }
    if (isReservedRoleName(editingRole?.name ?? '') && name.toLowerCase() !== currentRoleName) {
      toast.error('Owner and Customer roles cannot be renamed.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(editingRole ? `/backend-api/roles/${editingRole.id}` : '/backend-api/roles', {
        method: editingRole ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company_id: selectedCompany }),
      })
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message || `Unable to ${editingRole ? 'update' : 'create'} role.`)
      const savedRole = body.data as Role
      setRoles((current) => editingRole
        ? current.map((role) => role.id === savedRole.id ? savedRole : role)
        : [...current, savedRole],
      )
      setSelectedRoleId(String(savedRole.id))
      setRoleDialogOpen(false)
      toast.success(editingRole ? 'Role updated successfully.' : 'Role created successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save role.')
    } finally {
      setSaving(false)
    }
  }

  const toggleRoleStatus = async (role: Role) => {
    if (!selectedCompany) return
    const status = String(role.status) === '0' ? 1 : 0
    try {
      const response = await fetch(`/backend-api/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: role.name, status, company_id: selectedCompany }),
      })
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to update role status.')
      const updatedRole = body.data as Role
      setRoles((current) => current.map((item) => item.id === updatedRole.id ? updatedRole : item))
      toast.success(`Role ${status === 1 ? 'activated' : 'deactivated'} successfully.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update role status.')
    }
  }

  const deleteRole = async () => {
    if (!selectedCompany || !deletingRole) return
    if (isReservedRoleName(deletingRole.name)) {
      throw new Error('Owner and Customer roles cannot be deleted.')
    }
    const response = await fetch(`/backend-api/roles/${deletingRole.id}?company_id=${encodeURIComponent(selectedCompany)}`, {
      method: 'DELETE',
    })
    const body = await response.json()
    if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to delete role.')
    const remainingRoles = roles.filter((role) => role.id !== deletingRole.id)
    setRoles(remainingRoles)
    setSelectedRoleId((current) => current === String(deletingRole.id) ? String(remainingRoles[0]?.id ?? '') : current)
    setDeletingRole(null)
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="px-6 pt-8 lg:px-8">
        <div className="inline-flex h-11 rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button type="button" onClick={() => setTab('roles')} className={`flex items-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors ${tab === 'roles' ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'}`}><UserRoundCog className="size-4" />Role</button>
          <button type="button" onClick={() => setTab('permissions')} className={`flex items-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors ${tab === 'permissions' ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'}`}><ShieldCheck className="size-4" />Role Permissions</button>
        </div>
      </div>

      {tab === 'roles' ? (
        <section className="bg-white">
          <div className="flex flex-col gap-4 px-6 pt-6 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRoundCog className="size-5" /></span>
              <div><h2 className="text-2xl font-bold text-slate-950">Roles</h2><p className="mt-1 text-sm text-slate-500">Create and manage roles for this company.</p></div>
            </div>
            <Button type="button" onClick={() => openRoleDialog()} disabled={!selectedCompany} className="h-10 gap-2 bg-primary hover:bg-primary/90"><Plus className="size-4" />Add Role</Button>
          </div>
          {!selectedCompany ? <p className="px-6 pb-6 text-sm text-slate-500">Select a company before managing roles.</p> : rolesLoading ? <p className="px-6 pb-6 text-sm text-slate-500">Loading roles...</p> : !roles.length ? <p className="px-6 pb-6 text-sm text-slate-500">No roles configured yet.</p> : (
            <div className="mx-6 mb-6 overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 font-semibold">Role Name</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {roles.map((role) => {
                      const isActive = String(role.status ?? '1') !== '0'
                      const isProtectedRole = isReservedRoleName(role.name)
                      return <tr key={role.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-medium text-slate-900">{role.name}</td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-5 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger disabled={isProtectedRole} className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40" aria-label={`Actions for ${role.name}`}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openRoleDialog(role)} className="gap-2"><Pencil className="size-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => void toggleRoleStatus(role)} className="gap-2">{isActive ? <><CircleX className="size-4" />Deactivate</> : <><Check className="size-4" />Activate</>}</DropdownMenuItem>
                              {!isReservedRoleName(role.name) && <DropdownMenuItem onClick={() => setDeletingRole(role)} className="gap-2 text-destructive focus:text-destructive"><Trash2 className="size-4" />Delete</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white">
          {!selectedCompany ? <p className="p-6 text-sm text-slate-500">Select a company before managing role permissions.</p> : loading ? <p className="p-6 text-sm text-slate-500">Loading roles and modules…</p> : !roles.length ? <p className="p-6 text-sm text-slate-500">Create a role first, then assign its permissions here.</p> : (
            <div>
              <div className="px-6 pt-6 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span>
                  <div><h2 className="text-2xl font-bold text-slate-950">Role Permissions</h2><p className="mt-1 text-sm text-slate-500">Define permission sets for advisors, mechanics, and administrators.</p></div>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-5">
                <label className="flex w-full max-w-sm flex-col gap-2 text-sm font-semibold text-slate-800">Select Role
                  <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-primary">
                    {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                </label>
                <Button type="button" onClick={savePermissions} disabled={saving || isCustomerRole} className="h-10 bg-primary hover:bg-primary/90"><Save className="size-4" />{saving ? 'Saving…' : 'Save Permissions'}</Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} placeholder="Search permissions..." className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{selectedPermissionCount} permissions selected</span>
                <span className="text-slate-500">Enable actions for each sub module.</span>
                </div>
              </div>
              <div className="space-y-3 px-6 pb-6">
                {filteredModules.map((module) => {
                  const isExpanded = expandedModules[module.id]
                  return <div key={module.id} className="overflow-hidden rounded-lg border border-slate-200">
                    <button type="button" onClick={() => setExpandedModules((current) => ({ ...current, [module.id]: !isExpanded }))} className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left">
                      <span className="flex items-center gap-2 font-semibold text-slate-900">{isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}{module.name}</span>
                      <span className="text-xs text-slate-500">{module.subModules?.length ?? 0} sub modules</span>
                    </button>
                    {isExpanded && <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-left text-sm"><thead className="border-y border-slate-100 bg-white"><tr><th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Sub Module</th><th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">All</th>{actions.map((action) => <th key={action} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">{action}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
                        {(module.subModules ?? []).map((subModule) => {
                          const isCommunicationLogs = subModule.name.trim().toLowerCase() === 'communication logs'
                          const isCashPaymentDisabled = isCustomerRole && subModule.name.trim().toLowerCase() === 'cash payment'
                          const lockedActions = getLockedModuleActions(subModule.name)
                          const isLocked = lockedActions.length > 0
                          return <tr key={subModule.id}>
                            <td className="px-4 py-4 font-medium text-slate-800">{subModule.name}</td>
                            <td className="px-3 py-4 text-center"><div className="flex justify-center"><Switch size="sm" aria-label={`All permissions for ${subModule.name}`} checked={!isCashPaymentDisabled && actions.every((action) => Boolean(permissions[String(subModule.id)]?.[action]))} onCheckedChange={(checked) => toggleAllPermissions(subModule.id, checked)} disabled={isCustomerRole || isCommunicationLogs || isLocked || isCashPaymentDisabled} /></div></td>
                            {actions.map((action) => <td key={action} className="px-3 py-4 text-center"><div className="flex justify-center"><Switch size="sm" aria-label={`${action} ${subModule.name}`} checked={!isCashPaymentDisabled && Boolean(permissions[String(subModule.id)]?.[action])} onCheckedChange={(checked) => togglePermission(subModule.id, action, checked)} disabled={isCustomerRole || (isCommunicationLogs && action !== 'view') || lockedActions.includes(action) || isCashPaymentDisabled} /></div></td>)}
                          </tr>
                        })}
                      </tbody></table>
                    </div>}
                  </div>
                })}
                {!modules.length && <p className="text-sm text-slate-500">No modules are available. Create modules and sub modules first.</p>}
                {modules.length > 0 && !filteredModules.length && <p className="text-sm text-slate-500">No matching modules or sub modules found.</p>}
              </div>
            </div>
          )}
        </section>
      )}

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
            <DialogDescription>{editingRole ? 'Update the role name.' : 'Enter a name for the new role.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveRole} className="space-y-5">
            <label className="block text-sm font-medium text-foreground" htmlFor="role-name">
              <span>Role Name <span className="text-destructive">*</span></span>
              <input id="role-name" autoFocus value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="Enter role name" maxLength={100} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving || !roleName.trim()}>{saving ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={Boolean(deletingRole)}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        title="Delete role?"
        message={`Are you sure you want to delete ${deletingRole?.name ?? 'this role'}? This action cannot be undone.`}
        successMessage="Role deleted successfully."
        onConfirm={deleteRole}
      />
    </div>
  )
}
