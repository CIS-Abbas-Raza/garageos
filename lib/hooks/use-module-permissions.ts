import { useAuth } from "../auth-context"

/**
 * Hook to check permissions for a specific module resource.
 * Because we are running in Mock Mode, we assume super admin / full permissions
 * if the user has the "all" permission.
 *
 * @param resource The resource key (e.g. "vehicles", "job-cards")
 */
export function useModulePermissions(resource: string) {
  const { user } = useAuth()

  // In Mock Mode, if no user or user has "all", they can do everything.
  const hasAll = user?.permissions.includes("all")

  const can = (action: string) => {
    if (hasAll) return true
    return user?.permissions.includes(`${resource}.${action}`) ?? false
  }

  return {
    can,
    canView: can("view"),
    canCreate: can("create"),
    canUpdate: can("update"),
    canDelete: can("delete"),
  }
}
