// =============================================================================
// GARAGEOS API CLIENT — Mock/Offline Mode
// All data operations use local state. No backend dependency.
// =============================================================================

export enum RoleScope {
  SYSTEM = "SYSTEM",
  COMPANY = "COMPANY",
  BRANCH = "BRANCH",
}

export interface RoleAssignment {
  roleId: string
  roleName: string
  roleTypeName?: string | null
  scopeType: RoleScope
  scopeId: string | null
}

export type RolePermissionMap = Record<string, Partial<Record<'view' | 'create' | 'update' | 'deactivate' | 'delete', boolean>>>

export interface AuthUser {
  id: string
  userName: string
  email: string
  isPasswordChanged: boolean
  roleId?: string
  roleName?: string | null
  phoneNumber?: string | null
  permissions: string[] | RolePermissionMap
  roles: RoleAssignment[]
  address?: string | null
  country?: string | null
  state?: string | null
  profilePhoto?: string | null
}

// Mock credentials — accepted by the mock login
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@garageos.com": {
    password: "password",
    user: {
      id: "u-101",
      userName: "Garage Admin",
      email: "admin@garageos.com",
      isPasswordChanged: true,
      phoneNumber: "+1 555-0192",
      permissions: ["all"],
      roles: [
        {
          roleId: "r-1",
          roleName: "Super Admin",
          roleTypeName: "System",
          scopeType: RoleScope.SYSTEM,
          scopeId: null,
        },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// Token helpers — localStorage persistence
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("accessToken")
  return null
}

const AUTH_FETCH_INTERCEPTOR_FLAG = "__garageWorkOsAuthFetchInstalled"

/** Attach the saved login token to API requests across the app. */
export function installAuthFetchInterceptor() {
  if (typeof window === "undefined") return
  const windowWithInterceptor = window as Window & { __garageWorkOsAuthFetchInstalled?: boolean }
  if (windowWithInterceptor[AUTH_FETCH_INTERCEPTOR_FLAG]) return

  const originalFetch = window.fetch.bind(window)
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = input instanceof Request ? input.url : String(input)
    let url: URL
    try {
      url = new URL(rawUrl, window.location.origin)
    } catch {
      return originalFetch(input, init)
    }

    if (url.origin !== window.location.origin || !url.pathname.startsWith('/backend-api/')) {
      return originalFetch(input, init)
    }

    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const isPublicWebsitePackageList = method === 'GET'
      && url.pathname === '/backend-api/packages'
      && url.searchParams.get('limit') === '100'
    const headers = new Headers(input instanceof Request ? input.headers : undefined)
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value))
    if (isPublicWebsitePackageList) {
      return originalFetch(input, { ...init, cache: 'no-store', headers })
    }

    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return originalFetch(input, { ...init, cache: 'no-store', headers })
  }

  windowWithInterceptor[AUTH_FETCH_INTERCEPTOR_FLAG] = true
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("currentUser")
  }
}

// ---------------------------------------------------------------------------
// Mock login — validates against MOCK_USERS, any unknown email also works
// ---------------------------------------------------------------------------
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user: AuthUser; message?: string }> {
  await new Promise((r) => setTimeout(r, 600)) // simulate network delay

  const known = MOCK_USERS[email.toLowerCase()]
  if (known) {
    if (known.password !== password) {
      throw new Error("Invalid password. Try 'password'.")
    }
    const token = "mock_token_" + Date.now()
    setTokens(token, "refresh_" + token)
    localStorage.setItem("currentUser", JSON.stringify(known.user))
    return { success: true, user: known.user }
  }

  // Accept any email/password combo for demo purposes
  const demoUser: AuthUser = {
    id: "u-" + Date.now(),
    userName: email.split("@")[0] || "User",
    email,
    isPasswordChanged: true,
    phoneNumber: null,
    permissions: ["all"],
    roles: [
      {
        roleId: "r-1",
        roleName: "Admin",
        roleTypeName: "System",
        scopeType: RoleScope.SYSTEM,
        scopeId: null,
      },
    ],
  }
  const token = "mock_token_" + Date.now()
  setTokens(token, "refresh_" + token)
  localStorage.setItem("currentUser", JSON.stringify(demoUser))
  return { success: true, user: demoUser }
}

// ---------------------------------------------------------------------------
// Mock me — restore session from localStorage
// ---------------------------------------------------------------------------
export async function me(): Promise<{
  success: boolean
  user: AuthUser | null
}> {
  const token = getAccessToken()
  if (!token) return { success: false, user: null }

  const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null
  if (stored) {
    const user = JSON.parse(stored) as AuthUser
    let tokenPayload: { role_id?: number | string; company_id?: number | string } = {}
    try {
      const encodedPayload = token.split('.')[1]
      if (encodedPayload) {
        const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
        tokenPayload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
      }
    } catch {
      // Mock and older non-JWT tokens have no role claims.
    }

    const roleId = user.roleId ?? (tokenPayload.role_id ? String(tokenPayload.role_id) : undefined)
    const companyId = tokenPayload.company_id ?? localStorage.getItem("selectedCompany")
    if (roleId && companyId) {
      try {
        const response = await fetch(`/backend-api/roles/${encodeURIComponent(roleId)}/permissions?selectedCompanyId=${encodeURIComponent(String(companyId))}`)
        const body = await response.json()
        if (response.ok && body.success !== false && body.data?.permission) {
          user.roleId = roleId
          user.permissions = body.data.permission as RolePermissionMap
          localStorage.setItem("currentUser", JSON.stringify(user))
        }
      } catch {
        // Keep the cached session usable if permissions cannot be refreshed.
      }
    }
    return { success: true, user }
  }
  return { success: false, user: null }
}

export async function updateProfile(
  data: Pick<AuthUser, "userName" | "email" | "phoneNumber" | "address" | "country" | "state" | "profilePhoto"> & { profilePictureFile?: File | null; removeProfilePhoto?: boolean },
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const token = getAccessToken()
  const stored = localStorage.getItem("currentUser")
  if (!token || !stored) return { success: false, message: "Your session has expired." }
  const currentUser = JSON.parse(stored) as AuthUser

  const formData = new FormData()
  formData.append('name', data.userName)
  formData.append('email', data.email)
  formData.append('phone', data.phoneNumber ?? '')
  formData.append('address', data.address ?? '')
  formData.append('country', data.country ?? '')
  formData.append('state', data.state ?? '')
  if (data.profilePictureFile) formData.append('logo', data.profilePictureFile)
  if (data.removeProfilePhoto) formData.append('remove_logo', 'true')

  const response = await fetch('/backend-api/auth/profile', {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    return { success: false, message: body.message || body.error || "Unable to update this profile." }
  }

  const record = body.data ?? body
  const updated: AuthUser = {
    ...currentUser,
    userName: record.name ?? data.userName,
    email: record.email ?? data.email,
    phoneNumber: record.phone ?? data.phoneNumber,
    address: record.address ?? data.address,
    country: record.country ?? data.country,
    state: record.state ?? data.state,
    profilePhoto: record.logo ?? record.profile_photo ?? data.profilePhoto,
  }
  localStorage.setItem("currentUser", JSON.stringify(updated))
  return { success: true, user: updated }
}

export async function changePassword(
  newPassword: string,
): Promise<{ success: boolean; message?: string }> {
  const token = getAccessToken()
  if (!token) return { success: false, message: "Your session has expired." }

  const response = await fetch('/backend-api/auth/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    return { success: false, message: body.message || 'Unable to update this password.' }
  }

  const stored = localStorage.getItem('currentUser')
  if (stored) {
    const user = JSON.parse(stored) as AuthUser
    localStorage.setItem('currentUser', JSON.stringify({ ...user, isPasswordChanged: true }))
  }
  return { success: true, message: body.message }
}

// ---------------------------------------------------------------------------
// Mock logout
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  clearTokens()
}
