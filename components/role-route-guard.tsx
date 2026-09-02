'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { canAccessDashboardPath, getDashboardRole } from '@/lib/role-access'

export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isSuperAdmin } = useAuth()
  const role = getDashboardRole(user, isSuperAdmin)
  const allowed = canAccessDashboardPath(role, pathname)

  useEffect(() => {
    if (!allowed) router.replace('/dashboard')
  }, [allowed, router])

  if (!allowed) return null
  return <>{children}</>
}
