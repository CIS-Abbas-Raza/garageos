/**
 * ============================================================================
 * PERMISSION REGISTRY — Single source of truth for all frontend permissions
 * ============================================================================
 *
 * This registry defines modules, resources, and actions for Role Based Access Control.
 */

export interface PermissionAction {
  key: string
  label: string
  description?: string
  icon?: "view" | "create" | "edit" | "delete" | "export" | "import" | "approve" | "settings" | "custom"
}

export interface PermissionResource {
  resource: string
  label: string
  actions: PermissionAction[]
}

export interface PermissionModule {
  key: string
  label: string
  description?: string
  sortOrder: number
  icon?: string
  resources: PermissionResource[]
}

const CRUD_ACTIONS: PermissionAction[] = [
  { key: "view", label: "View", description: "View records", icon: "view" },
  { key: "create", label: "Create", description: "Create new records", icon: "create" },
  { key: "update", label: "Update", description: "Edit existing records", icon: "edit" },
  { key: "delete", label: "Delete", description: "Delete records", icon: "delete" },
]

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: "operations",
    label: "Operations",
    description: "Core garage operations",
    sortOrder: 1,
    icon: "wrench",
    resources: [
      { resource: "vehicles", label: "Vehicles", actions: CRUD_ACTIONS },
      { resource: "job-cards", label: "Job Cards", actions: CRUD_ACTIONS },
      { resource: "customers", label: "Customers", actions: CRUD_ACTIONS },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    description: "Billing and invoicing",
    sortOrder: 2,
    icon: "credit-card",
    resources: [
      { resource: "invoices", label: "Invoices", actions: CRUD_ACTIONS },
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Parts and supplies",
    sortOrder: 3,
    icon: "package",
    resources: [
      { resource: "inventory", label: "Inventory", actions: CRUD_ACTIONS },
    ],
  },
  {
    key: "system",
    label: "System",
    description: "User management and roles",
    sortOrder: 4,
    icon: "shield",
    resources: [
      { resource: "users", label: "Users", actions: CRUD_ACTIONS },
      { resource: "roles", label: "Roles", actions: CRUD_ACTIONS },
    ],
  },
]
