import { useAuth } from "@/hooks/use-auth"
import { getDefaultRoute } from "@/lib/rbac"
import type { PermissionKey } from "@/api/auth"
import { useEffect, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function PageLoader() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function HomeRedirect() {
  const { permissions, isLoading } = useAuth()

  if (isLoading) return <PageLoader />
  return <Navigate to={getDefaultRoute(permissions)} replace />
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: PermissionKey
  children: ReactNode
}) {
  const { permissions, isLoading, can } = useAuth()
  const location = useLocation()
  const allowed = can(permission)

  useEffect(() => {
    if (!isLoading && !allowed) {
      toast.error("You do not have permission to access this page", {
        id: "route-forbidden",
      })
    }
  }, [isLoading, allowed, location.pathname])

  if (isLoading) return <PageLoader />
  if (!allowed) return <Navigate to={getDefaultRoute(permissions)} replace />

  return children
}

export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const { permissions, isLoading, isSuperAdmin } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      toast.error("Super admin access is required for this page", {
        id: "route-forbidden",
      })
    }
  }, [isLoading, isSuperAdmin, location.pathname])

  if (isLoading) return <PageLoader />
  if (!isSuperAdmin) return <Navigate to={getDefaultRoute(permissions)} replace />

  return children
}
