import type { AdminPermissions, PermissionKey } from "@/api/auth"

export const PERMISSION_KEYS: PermissionKey[] = [
  "can_manage_staff",
  "can_manage_user",
  "can_manage_balance",
  "can_generate_report",
  "can_manage_fund",
]

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  can_manage_staff: "Manage staff",
  can_manage_user: "Manage users / students",
  can_manage_balance: "Manage coupon balances",
  can_generate_report: "Generate reports",
  can_manage_fund: "Manage funds",
}

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  can_manage_staff: "Search, import and edit staff accounts.",
  can_manage_user: "Search, import and edit student accounts.",
  can_manage_balance:
    "Update coupon balances, activate coupons, and void transactions.",
  can_generate_report:
    "View the dashboard and student, staff, cafe and directed reports.",
  can_manage_fund: "Create and update funds.",
}

export const NO_PERMISSIONS: AdminPermissions = {
  can_manage_staff: false,
  can_manage_user: false,
  can_manage_balance: false,
  can_generate_report: false,
  can_manage_fund: false,
}

export const ALL_PERMISSIONS: AdminPermissions = {
  can_manage_staff: true,
  can_manage_user: true,
  can_manage_balance: true,
  can_generate_report: true,
  can_manage_fund: true,
}

export function getDefaultRoute(permissions: AdminPermissions): string {
  if (permissions.can_generate_report) return "/ekupon-admin/dashboard"
  if (permissions.can_manage_user) return "/ekupon-admin/student"
  if (permissions.can_manage_staff) return "/ekupon-admin/staff"
  return "/ekupon-admin/cafe"
}
