'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
