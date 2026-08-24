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

export interface AuthUser {
  id: string
  userName: string
  email: string
  isPasswordChanged: boolean
  phoneNumber?: string | null
  permissions: string[]
  roles: RoleAssignment[]
  address?: string | null
  country?: string | null
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
    return { success: true, user: JSON.parse(stored) as AuthUser }
  }
  return { success: false, user: null }
}

export async function updateProfile(
  userId: string,
  data: Pick<AuthUser, "userName" | "email" | "phoneNumber" | "address" | "country" | "profilePhoto">,
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const stored = localStorage.getItem("currentUser")
  if (!stored) return { success: false, message: "Your session has expired." }
  const currentUser = JSON.parse(stored) as AuthUser
  if (currentUser.id !== userId) return { success: false, message: "Unable to update this profile." }

  const response = await fetch(`/backend-api/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.userName,
      email: data.email,
      phone: data.phoneNumber,
      address: data.address,
      country: data.country,
      profile_photo: data.profilePhoto,
    }),
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
    profilePhoto: record.profile_photo ?? data.profilePhoto,
  }
  localStorage.setItem("currentUser", JSON.stringify(updated))
  return { success: true, user: updated }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const stored = localStorage.getItem("currentUser")
  if (!stored) return { success: false, message: "Your session has expired." }
  const user = JSON.parse(stored) as AuthUser
  if (user.id !== userId) return { success: false, message: "Unable to update this password." }

  const storedPassword = localStorage.getItem(`mockPassword:${userId}`) ?? (user.email === "admin@garageos.com" ? "password" : "password")
  if (currentPassword !== storedPassword) return { success: false, message: "Current password is incorrect." }
  localStorage.setItem(`mockPassword:${userId}`, newPassword)
  localStorage.setItem("currentUser", JSON.stringify({ ...user, isPasswordChanged: true }))
  return { success: true }
}

// ---------------------------------------------------------------------------
// Mock logout
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  clearTokens()
}
