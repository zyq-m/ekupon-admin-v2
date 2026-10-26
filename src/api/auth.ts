import api from "./client"

export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "STUDENT"
  | "CAFE"

export type PermissionKey =
  | "can_manage_staff"
  | "can_manage_user"
  | "can_manage_balance"
  | "can_generate_report"
  | "can_manage_fund"

export type AdminPermissions = Record<PermissionKey, boolean>

export type AdminFund = {
  id: number
  name: string
  amount: number
  start_use: string
  expired: string
}

export type AdminProfile = {
  email: string
  name: string
  is_super_admin: boolean
  permissions: AdminPermissions
  funds: AdminFund[]
}

export type UserProfile = {
  joined: string
  role: { name: RoleName }
  admin: AdminProfile | null
  student?: unknown
  cafe?: unknown
  staff?: unknown
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export type LoginReqBody = {
  id: string
  password: string
}

export type SetPasswordReqBody = {
  token: string
  password: string
  rePass: string
}

export type SetPasswordResponse = {
  message: string
}

// ========== suspend user ==========
export type SuspendUserBody = {
  id: number
  active: boolean
}

export type SuspendUserResponse = {
  message: string
  // add any other fields your backend returns if needed
}

export const authAPI = {
  login: (loginBody: LoginReqBody) =>
    api.post<LoginResponse>("/auth/login", loginBody).then((res) => res.data),

  setPassword: (body: SetPasswordReqBody) =>
    api
      .post<SetPasswordResponse>("/auth/set-password", body)
      .then((res) => res.data),

  getProfile: () =>
    api.get<UserProfile>("/auth/profile").then((res) => res.data),

  // Suspend (or activate) a user
  suspendUser: (body: SuspendUserBody) =>
    api.post<SuspendUserResponse>("/auth/suspend", body).then((res) => res.data),
}
