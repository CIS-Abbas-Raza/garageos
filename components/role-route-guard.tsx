'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { canAccessDashboardPath, getDashboardRole } from '@/lib/role-access'
import { pathToSubModule, useRolePermissions } from '@/lib/hooks/use-role-permissions'

export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { canSubModule, isReady } = useRolePermissions()
  const role = getDashboardRole(user)
  const permissionName = Object.entries(pathToSubModule).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1]
  const allowed = canAccessDashboardPath(role, pathname) && (!permissionName || canSubModule(permissionName, 'view'))

  useEffect(() => {
    if (!allowed) router.replace('/dashboard')
  }, [allowed, router])

  if (!isReady || !allowed) return null
  return <>{children}</>
}
