'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Save, Search, ShieldCheck, UserRoundCog } from 'lucide-react'
import { toast } from 'sonner'
import { useBranch } from '@/lib/branch-context'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

type Action = 'view' | 'create' | 'update' | 'deactivate' | 'delete'
type PermissionSet = Partial<Record<Action, boolean>>
type Role = { id: number; name: string }
type SubModule = { id: number; name: string }
type Module = { id: number; name: string; subModules?: SubModule[] }

const actions: Action[] = ['view', 'create', 'update', 'deactivate', 'delete']

export function RoleManagementPage() {
  const { selectedCompany } = useBranch()
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({})
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [permissionSearch, setPermissionSearch] = useState('')
  const selectedPermissionCount = Object.values(permissions).reduce(
    (total, permission) => total + actions.filter((action) => permission[action]).length,
    0,
  )
  const normalizedPermissionSearch = permissionSearch.trim().toLowerCase()
  const filteredModules = modules.map((module) => ({
    ...module,
    subModules: (module.subModules ?? []).filter((subModule) =>
      !normalizedPermissionSearch || module.name.toLowerCase().includes(normalizedPermissionSearch) || subModule.name.toLowerCase().includes(normalizedPermissionSearch),
    ),
  })).filter((module) => !normalizedPermissionSearch || module.name.toLowerCase().includes(normalizedPermissionSearch) || module.subModules.length > 0)

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
        setPermissions(body.data?.permission ?? {})
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load permissions.')
      }
    }
    void loadPermissions()
  }, [selectedCompany, selectedRoleId])

  const togglePermission = (subModuleId: number, action: Action, checked: boolean) => {
    setPermissions((current) => ({
      ...current,
      [String(subModuleId)]: { ...current[String(subModuleId)], [action]: checked },
    }))
  }

  const toggleAllPermissions = (subModuleId: number, checked: boolean) => {
    setPermissions((current) => ({
      ...current,
      [String(subModuleId)]: Object.fromEntries(actions.map((action) => [action, checked])),
    }))
  }

  const savePermissions = async () => {
    if (!selectedCompany || !selectedRoleId) return
    setSaving(true)
    try {
      const response = await fetch(`/backend-api/roles/${selectedRoleId}/permissions?company_id=${encodeURIComponent(selectedCompany)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      })
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message || 'Unable to save permissions.')
      setPermissions(body.data?.permission ?? permissions)
      toast.success('Role permissions saved successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save permissions.')
    } finally {
      setSaving(false)
    }
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
        <EntityCrudPage config={{ resource: 'roles', apiEndpoint: '/backend-api/roles', companyScoped: true, title: 'Roles Managment', description: 'Define permission sets for advisors, mechanics, and administrators.', fields: [], columns: ['name', 'status'], empty: 'No roles configured yet.' }} />
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
                <Button type="button" onClick={savePermissions} disabled={saving} className="h-10 bg-primary hover:bg-primary/90"><Save className="size-4" />{saving ? 'Saving…' : 'Save Permissions'}</Button>
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
                        {(module.subModules ?? []).map((subModule) => <tr key={subModule.id}><td className="px-4 py-4 font-medium text-slate-800">{subModule.name}</td><td className="px-3 py-4 text-center"><div className="flex justify-center"><Switch size="sm" aria-label={`All permissions for ${subModule.name}`} checked={actions.every((action) => Boolean(permissions[String(subModule.id)]?.[action]))} onCheckedChange={(checked) => toggleAllPermissions(subModule.id, checked)} /></div></td>{actions.map((action) => <td key={action} className="px-3 py-4 text-center"><div className="flex justify-center"><Switch size="sm" aria-label={`${action} ${subModule.name}`} checked={Boolean(permissions[String(subModule.id)]?.[action])} onCheckedChange={(checked) => togglePermission(subModule.id, action, checked)} /></div></td>)}</tr>)}
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
    </div>
  )
}
