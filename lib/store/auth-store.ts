'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  isLoggedIn: boolean
  email: string | null
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      email: null,
      login: (email: string) => {
        set({ isLoggedIn: true, email })
      },
      logout: () => {
        set({ isLoggedIn: false, email: null })
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
