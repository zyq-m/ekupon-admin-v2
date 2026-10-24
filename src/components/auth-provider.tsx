import { authAPI, type PermissionKey } from "@/api/auth"
import { AuthContext } from "@/context/auth-context"
import { NO_PERMISSIONS } from "@/lib/rbac"
import { useQuery } from "@tanstack/react-query"
import { useMemo, type ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasToken = !!localStorage.getItem("accessToken")

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const admin = profile?.admin ?? undefined
  const isSuperAdmin = admin?.is_super_admin ?? false
  const permissions = admin?.permissions ?? NO_PERMISSIONS

  const value = useMemo(
    () => ({
      profile,
      admin,
      permissions,
      isSuperAdmin,
      isLoading: hasToken && isLoading,
      can: (permission: PermissionKey) =>
        isSuperAdmin || permissions[permission] === true,
    }),
    [profile, admin, permissions, isSuperAdmin, hasToken, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
