'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace('/login')
    }
  }, [hydrated, isLoggedIn, router])

  if (!hydrated || !isLoggedIn) {
    return null
  }

  return <>{children}</>
}
