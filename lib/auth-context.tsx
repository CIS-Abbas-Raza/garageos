"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  logout as apiLogout,
  me as apiMe,
  setTokens,
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
  loginAdmin: (email: string, password: string) => Promise<void>
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
    const response = await fetch('/backend-api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok || result.success === false || !result.token || !result.user) {
      throw new Error(result.message || 'Login failed.')
    }

    const userRoleScope = result.company_id ? RoleScope.COMPANY : RoleScope.SYSTEM
    const loggedInUser: AuthUser = {
      id: String(result.user.id),
      userName: result.user.name || result.user.email,
      email: result.user.email,
      isPasswordChanged: true,
      phoneNumber: result.user.phone ?? null,
      permissions: [],
      roles: [{
        roleId: String(result.role || 'user'),
        roleName: result.role || 'User',
        roleTypeName: null,
        scopeType: userRoleScope,
        scopeId: result.company_id ? String(result.company_id) : null,
      }],
    }

    setTokens(result.token, result.token)
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser))
    if (result.company_id) {
      localStorage.setItem('selectedCompany', String(result.company_id))
    } else {
      localStorage.removeItem('selectedCompany')
    }
    setUser(loggedInUser)
    setRoleScope(userRoleScope)
  }

  const loginAdmin = async (email: string, password: string) => {
    const response = await fetch('/backend-api/admins/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok || result.success === false || !result.token || !result.user) {
      throw new Error(result.message || 'Admin login failed.')
    }

    const adminUser: AuthUser = {
      id: String(result.user.id),
      userName: result.user.name || result.user.email,
      email: result.user.email,
      isPasswordChanged: true,
      phoneNumber: result.user.phone ?? null,
      permissions: ['all'],
      roles: [{
        roleId: 'super-admin',
        roleName: result.role || 'Super Admin',
        roleTypeName: 'System',
        scopeType: RoleScope.SYSTEM,
        scopeId: null,
      }],
    }

    setTokens(result.token, result.token)
    localStorage.setItem('currentUser', JSON.stringify(adminUser))
    setUser(adminUser)
    setRoleScope(RoleScope.SYSTEM)
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
        loginAdmin,
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
