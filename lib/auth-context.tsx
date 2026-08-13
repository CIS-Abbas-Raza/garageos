"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  clearTokens,
  RoleScope,
} from "./api"
import type { AuthUser, RoleAssignment } from "./api"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresPasswordChange: boolean
  roleScope: RoleScope | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roleScope, setRoleScope] = useState<RoleScope | null>(null)

  const computeScope = (roles: RoleAssignment[]) => {
    if (!roles || roles.length === 0) return null
    if (roles.some((r) => r.scopeType === RoleScope.SYSTEM)) return RoleScope.SYSTEM
    if (roles.some((r) => r.scopeType === RoleScope.COMPANY)) return RoleScope.COMPANY
    return RoleScope.BRANCH
  }

  const refreshUser = async () => {
    const result = await apiMe()
    if (result.success && result.user) {
      setUser(result.user)
      setRoleScope(computeScope(result.user.roles))
    }
  }

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const result = await apiMe()
        if (result.success && result.user) {
          setUser(result.user)
          setRoleScope(computeScope(result.user.roles))
        } else {
          clearTokens()
        }
      } catch {
        clearTokens()
      }
      setIsLoading(false)
    }
    restore()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password)
    if (!result.success || !result.user) {
      throw new Error("Login failed")
    }
    setUser(result.user)
    setRoleScope(computeScope(result.user.roles))
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    } finally {
      setUser(null)
      setRoleScope(null)
      clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  const isSuperAdmin =
    user?.roles?.some(
      (r) => r.roleTypeName === "System" || r.roleName === "Super Admin"
    ) ?? false

  const requiresPasswordChange = !!user && !user.isPasswordChanged && !isSuperAdmin

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        requiresPasswordChange,
        roleScope,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
