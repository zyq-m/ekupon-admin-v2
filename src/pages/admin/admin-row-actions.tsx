import type { AdminAccount } from "@/api/admin"
import ActionDropdown from "@/components/action-dropdown"
import {
  ChangeRoleDialog,
  EditPermissionsDialog,
  ManageFundsDialog,
} from "@/components/form/admin-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useResendInvite, useSuspendAdmin } from "@/hooks/use-admin"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function AdminRowActions({ admin }: { admin: AdminAccount }) {
  const { admin: currentAdmin } = useAuth()
  const self = currentAdmin?.email === admin.email
  const suspend = useSuspendAdmin()
  const resend = useResendInvite()
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [fundsOpen, setFundsOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [reinviteOpen, setReinviteOpen] = useState(false)

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
              onClick={() => setReinviteOpen(true)}
              disabled={resend.isPending}
            >
              Reinvite admin
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
      {reinviteOpen && (
        <AlertDialog open={reinviteOpen} onOpenChange={setReinviteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reinvite admin</AlertDialogTitle>
              <AlertDialogDescription>
                Send a new invitation link to {admin.email}? Any previous
                invitation link will stop working.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={resend.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={resend.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  resend.mutate(admin.email, {
                    onSuccess: () => setReinviteOpen(false),
                  })
                }}
              >
                {resend.isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> Sending…
                  </>
                ) : (
                  "Reinvite"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
