import type { AdminAccount } from "@/api/admin"
import ActionDropdown from "@/components/action-dropdown"
import {
  ChangeRoleDialog,
  EditPermissionsDialog,
  ManageFundsDialog,
} from "@/components/form/admin-form"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useResendInvite, useSuspendAdmin } from "@/hooks/use-admin"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

export function AdminRowActions({ admin }: { admin: AdminAccount }) {
  const { admin: currentAdmin } = useAuth()
  const self = currentAdmin?.email === admin.email
  const suspend = useSuspendAdmin()
  const resend = useResendInvite()
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [fundsOpen, setFundsOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)

  return (
    <>
      <ActionDropdown>
        <DropdownMenuItem onClick={() => setPermissionsOpen(true)}>
          Edit permissions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFundsOpen(true)}>
          Manage funds
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRoleOpen(true)} disabled={self}>
          Change role
        </DropdownMenuItem>

        {!admin.is_active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => resend.mutate(admin.email)}
              disabled={resend.isPending}
            >
              Resend invite
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={admin.is_active ? "destructive" : "default"}
          disabled={self || suspend.isPending}
          onClick={() =>
            suspend.mutate({ email: admin.email, active: !admin.is_active })
          }
        >
          {admin.is_active ? "Suspend" : "Reactivate"}
        </DropdownMenuItem>
      </ActionDropdown>

      {permissionsOpen && (
        <EditPermissionsDialog
          admin={admin}
          open={permissionsOpen}
          onOpenChange={setPermissionsOpen}
        />
      )}
      {fundsOpen && (
        <ManageFundsDialog
          admin={admin}
          open={fundsOpen}
          onOpenChange={setFundsOpen}
        />
      )}
      {roleOpen && (
        <ChangeRoleDialog
          admin={admin}
          open={roleOpen}
          onOpenChange={setRoleOpen}
          isSelf={self}
        />
      )}
    </>
  )
}
