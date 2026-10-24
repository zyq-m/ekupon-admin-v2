import {
  adminAPI,
  type InviteAdminInput,
  type InviteAdminResponse,
} from "@/api/admin"
import type { AdminPermissions, RoleName } from "@/api/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const adminKeys = {
  all: ["admin"] as const,
  detail: (email: string) => ["admin", email] as const,
}

function getErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  )
}

export function useGetAdmins() {
  return useQuery({
    queryKey: adminKeys.all,
    queryFn: adminAPI.listAdmins,
  })
}

export function useInviteAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InviteAdminInput) => adminAPI.inviteAdmin(input),
    onSuccess: (res: InviteAdminResponse) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      if (res.emailSent) {
        toast.success(`Invitation sent to ${res.email}`)
      } else {
        toast.warning(
          `Admin created, but the invitation email failed. Use Resend invite.`
        )
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to invite admin")),
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (email: string) => adminAPI.resendInvite(email),
    onSuccess: (res) => toast.success(res.message),
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to resend invitation")),
  })
}

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      email,
      permissions,
    }: {
      email: string
      permissions: Partial<AdminPermissions>
    }) => adminAPI.updatePermissions(email, permissions),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.detail(res.email) })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Permissions updated")
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to update permissions")),
  })
}

export function useUpdateAdminFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, fundIds }: { email: string; fundIds: number[] }) =>
      adminAPI.updateFunds(email, fundIds),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.detail(res.email) })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Fund access updated")
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to update fund access")),
  })
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      email,
      role,
    }: {
      email: string
      role: Extract<RoleName, "ADMIN" | "SUPER_ADMIN">
    }) => adminAPI.updateRole(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Role updated")
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to update role")),
  })
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, active }: { email: string; active: boolean }) =>
      adminAPI.suspendAdmin(email, active),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      toast.success(vars.active ? "Admin reactivated" : "Admin suspended")
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Failed to update admin status")),
  })
}
