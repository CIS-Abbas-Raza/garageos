'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { BranchProvider } from '@/lib/branch-context'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { RoleRouteGuard } from '@/components/role-route-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AuthGuard>
      <BranchProvider>
        <RoleRouteGuard>
          <div className="flex h-screen overflow-hidden bg-background">
            <DashboardSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <DashboardHeader title="GarageOS" />
              <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </RoleRouteGuard>
      </BranchProvider>
    </AuthGuard>
  );
}
