import type { AuthUser } from './api'

export type DashboardRole = 'portal'

export const isSuperAdminAssignment = (user: AuthUser | null) =>
  user?.roles?.some((role) =>
    role.roleId === 'super-admin'
    && role.roleName === 'SuperAdmin'
    && role.roleTypeName === 'System'
    && role.scopeType === 'SYSTEM'
    && role.scopeId === null,
  ) ?? false

export const getDashboardRole = (_user: AuthUser | null): DashboardRole => 'portal'

export const canAccessDashboardPath = (_role: DashboardRole, _pathname: string) => true
