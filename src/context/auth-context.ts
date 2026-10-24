import type {
  AdminPermissions,
  AdminProfile,
  PermissionKey,
  UserProfile,
} from "@/api/auth"
import { createContext } from "react"

export type AuthContextValue = {
  profile?: UserProfile
  admin?: AdminProfile
  permissions: AdminPermissions
  isSuperAdmin: boolean
  isLoading: boolean
  can: (permission: PermissionKey) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)
