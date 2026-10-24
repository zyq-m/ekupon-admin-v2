import api from "./client"
import type {
  AdminFund,
  AdminPermissions,
  AdminProfile,
  RoleName,
} from "./auth"

export type AdminAccount = AdminProfile & {
  user_id: number
  is_active: boolean
  role: RoleName
  joined: string
}

export type InviteAdminInput = {
  email: string
  name: string
  permissions?: Partial<AdminPermissions>
  fund_ids?: number[]
}

export type InviteAdminResponse = AdminAccount & {
  emailSent: boolean
}

export const adminAPI = {
  listAdmins: () => api.get<AdminAccount[]>("/admin").then((r) => r.data),

  getAdmin: (email: string) =>
    api
      .get<AdminAccount>(`/admin/${encodeURIComponent(email)}`)
      .then((r) => r.data),

  inviteAdmin: (input: InviteAdminInput) =>
    api
      .post<InviteAdminResponse>("/admin/invite", input)
      .then((r) => r.data),

  resendInvite: (email: string) =>
    api
      .post<{ message: string }>(
        `/admin/${encodeURIComponent(email)}/resend`
      )
      .then((r) => r.data),

  updatePermissions: (
    email: string,
    permissions: Partial<AdminPermissions>
  ) =>
    api
      .patch<AdminAccount>(
        `/admin/${encodeURIComponent(email)}/permissions`,
        { permissions }
      )
      .then((r) => r.data),

  updateFunds: (email: string, fundIds: number[]) =>
    api
      .put<AdminAccount>(`/admin/${encodeURIComponent(email)}/funds`, {
        fund_ids: fundIds,
      })
      .then((r) => r.data),

  updateRole: (email: string, role: Extract<RoleName, "ADMIN" | "SUPER_ADMIN">) =>
    api
      .patch<AdminAccount>(`/admin/${encodeURIComponent(email)}/role`, { role })
      .then((r) => r.data),

  suspendAdmin: (email: string, active: boolean) =>
    api
      .post<AdminAccount>(`/admin/${encodeURIComponent(email)}/suspend`, {
        active,
      })
      .then((r) => r.data),
}

export type { AdminFund }
