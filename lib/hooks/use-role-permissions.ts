'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { RolePermissionMap } from '@/lib/api'

type SubModule = { id: number; name: string }
type Module = { id: number; name: string; subModules?: SubModule[] }
type PermissionAction = 'view' | 'create' | 'update' | 'deactivate' | 'delete'

const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase()

const aliases: Record<string, string[]> = {
  companyusers: ['companyemployees'],
  rolemanagement: ['roles', 'rolesmanagment'],
  allvehicle: ['vehicles'],
  customers: ['customer'],
  reviews: ['customerreview'],
  smssetting: ['smssettings'],
  whatsappsetting: ['whatsappsettings'],
  emailsettingsendgrid: ['emailsettings', 'sendgridsettings'],
}

export const pathToSubModule: Record<string, string> = {
  '/admin': 'Admin', '/users': 'Users', '/packages': 'Package', '/modules': 'Modules',
  '/companies': 'Companies', '/package-subscriptions': 'Package Subscriptions',
  '/sms-settings': 'SMS Setting', '/whatsapp-settings': 'WhatsApp Setting', '/email-settings': 'Email Setting (SendGrid)',
  '/company-users': 'Company Employees', '/roles': 'Role Management', '/communication-logs': 'Communication Logs',
  '/customers': 'Customers', '/all-vehicle': 'All Vehicles', '/assigned-tasks': 'Assigned Tasks',
  '/appointments': 'Appointments', '/reviews': 'Customer Review', '/all-invoices': 'All Invoices',
  '/invoice-payments': 'Invoice Payments', '/sales': 'Sales', '/company-accounts': 'Company Account',
  '/account-ledger': 'Account Ledger', '/notifications': 'Notifications',
}

export function useRolePermissions() {
  const { user, isSuperAdmin } = useAuth()
  const [modules, setModules] = useState<Module[] | null>(null)

  useEffect(() => {
    if (isSuperAdmin) return
    let cancelled = false
    fetch('/backend-api/modules').then(async (response) => {
      const body = await response.json()
      if (!response.ok || body.success === false) throw new Error(body.message)
      if (!cancelled) setModules(body.data ?? [])
    }).catch(() => { if (!cancelled) setModules([]) })
    return () => { cancelled = true }
  }, [isSuperAdmin])

  const permissions = (Array.isArray(user?.permissions) ? {} : user?.permissions ?? {}) as RolePermissionMap
  const canSubModule = useMemo(() => (name: string, action: PermissionAction = 'view') => {
    if (isSuperAdmin) return true
    if (!modules) return false
    const requested = normalize(name)
    const validNames = new Set([requested, ...(aliases[requested] ?? [])])
    const subModule = modules.flatMap((module) => module.subModules ?? []).find((item) => validNames.has(normalize(item.name)))
    return Boolean(subModule && permissions[String(subModule.id)]?.[action])
  }, [isSuperAdmin, modules, permissions])

  return { canSubModule, isReady: isSuperAdmin || modules !== null }
}
