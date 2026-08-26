import type { AuthUser } from './api'

export type DashboardRole = 'superadmin' | 'owner' | 'staff' | 'mechanic' | 'finance' | 'customer' | 'unknown'

const ROLE_PATHS: Record<DashboardRole, string[]> = {
  superadmin: ['*'],
  owner: ['/company-users', '/customers', '/vehicles', '/quotations', '/task-cards', '/assigned-tasks', '/appointments', '/reviews', '/invoice-payments', '/sales', '/company-accounts', '/account-ledger', '/communication-logs', '/notifications'],
  staff: ['/customers', '/vehicles', '/quotations', '/task-cards', '/assigned-tasks', '/appointments', '/reviews', '/notifications'],
  mechanic: ['/assigned-tasks', '/notifications'],
  finance: ['/invoice-payments', '/sales', '/company-accounts', '/account-ledger', '/notifications'],
  customer: ['/customers', '/notifications'],
  unknown: [],
}

const ALWAYS_ALLOWED_PATHS = ['/dashboard', '/settings/profile', '/profile', '/my-notifications']

export const getDashboardRole = (user: AuthUser | null, isSuperAdmin = false): DashboardRole => {
  if (isSuperAdmin) return 'superadmin'
  const roleName = user?.roles?.[0]?.roleName?.replace(/[\s_-]/g, '').toLowerCase()
  if (roleName === 'owner' || roleName === 'staff' || roleName === 'mechanic' || roleName === 'finance' || roleName === 'customer') {
    return roleName
  }
  return 'unknown'
}

export const canAccessDashboardPath = (role: DashboardRole, pathname: string) => {
  if (ALWAYS_ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true
  const allowedPaths = ROLE_PATHS[role]
  return allowedPaths.includes('*') || allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
