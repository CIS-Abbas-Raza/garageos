'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { BranchProvider } from '@/lib/branch-context'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

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
        <div className="flex h-screen overflow-hidden bg-background">
          <DashboardSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader title="GarageOS" />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </BranchProvider>
    </AuthGuard>
  );
}
