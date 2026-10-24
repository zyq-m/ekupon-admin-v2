import type { AdminAccount } from "@/api/admin"
import type { AdminPermissions, PermissionKey } from "@/api/auth"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  useInviteAdmin,
  useUpdateAdminFunds,
  useUpdateAdminPermissions,
  useUpdateAdminRole,
} from "@/hooks/use-admin"
import { useGetFunds } from "@/hooks/use-fund"
import {
  NO_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_KEYS,
  PERMISSION_LABELS,
} from "@/lib/rbac"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

function PermissionsField({
  value,
  onChange,
  disabled,
}: {
  value: AdminPermissions
  onChange: (permissions: AdminPermissions) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      {PERMISSION_KEYS.map((key: PermissionKey) => (
        <div key={key} className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{PERMISSION_LABELS[key]}</p>
            <p className="text-xs text-muted-foreground">
              {PERMISSION_DESCRIPTIONS[key]}
            </p>
          </div>
          <Switch
            checked={value[key]}
            disabled={disabled}
            onCheckedChange={(checked) =>
              onChange({ ...value, [key]: checked })
            }
          />
        </div>
      ))}
    </div>
  )
}

function FundPicker({
  selected,
  onChange,
}: {
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const { data: funds, isLoading } = useGetFunds()
  const anchor = useComboboxAnchor()

  const fundItems =
    funds?.map((fund) => ({
      value: String(fund.id),
      label: fund.name,
    })) ?? []

  const handleValueChange = (values: string[] | null) => {
    if (!values) {
      onChange([])
      return
    }
    const ids = values.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    onChange(ids)
  }

  return (
    <div className="space-y-2">
      <Combobox
        multiple
        autoHighlight
        items={fundItems}
        value={selected.map((id) => String(id))}
        onValueChange={handleValueChange}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value: string) => {
                  const fund = funds?.find((f) => String(f.id) === value)
                  return (
                    <ComboboxChip key={value}>
                      {fund?.name ?? value}
                    </ComboboxChip>
                  )
                })}
                <ComboboxChipsInput
                  placeholder={
                    isLoading
                      ? "Loading funds…"
                      : values.length === 0
                        ? "Select funds"
                        : ""
                  }
                  disabled={isLoading || fundItems.length === 0}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No funds found</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export function InviteAdminDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [permissions, setPermissions] =
    useState<AdminPermissions>(NO_PERMISSIONS)
  const [fundIds, setFundIds] = useState<number[]>([])
  const invite = useInviteAdmin()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !name.trim()) {
      toast.error("Email and name are required")
      return
    }

    invite.mutate(
      {
        email: email.trim(),
        name: name.trim(),
        permissions,
        fund_ids: fundIds,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite admin</DialogTitle>
          <DialogDescription>
            The invited admin will receive an email to set their password.
          </DialogDescription>
        </DialogHeader>

        <form
          id="invite-admin-form"
          onSubmit={onSubmit}
          className="max-h-[50vh] space-y-4 overflow-x-clip overflow-y-auto"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="newadmin@unisza.edu.my"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-name">Name</FieldLabel>
              <Input
                id="invite-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="New Admin"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel>Permissions</FieldLabel>
              <FieldDescription>
                Only the selected actions will be available to this admin.
              </FieldDescription>
              <PermissionsField value={permissions} onChange={setPermissions} />
            </Field>
            <Field>
              <FieldLabel>Fund access</FieldLabel>
              <FieldDescription>
                Select the funds this admin may access.
              </FieldDescription>
              <FundPicker selected={fundIds} onChange={setFundIds} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-admin-form"
            disabled={invite.isPending}
          >
            {invite.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Inviting…
              </>
            ) : (
              "Send invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EditPermissionsDialog({
  admin,
  open,
  onOpenChange,
}: {
  admin: AdminAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [permissions, setPermissions] = useState<AdminPermissions>(
    admin.permissions
  )
  const update = useUpdateAdminPermissions()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    update.mutate(
      { email: admin.email, permissions },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit permissions</DialogTitle>
          <DialogDescription>
            {admin.name} · {admin.email}
          </DialogDescription>
        </DialogHeader>

        <form id="edit-permissions-form" onSubmit={onSubmit}>
          <PermissionsField
            value={permissions}
            onChange={setPermissions}
            disabled={admin.is_super_admin}
          />
          {admin.is_super_admin && (
            <p className="mt-3 text-xs text-muted-foreground">
              Super admins always have all permissions.
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-permissions-form"
            disabled={update.isPending || admin.is_super_admin}
          >
            {update.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save permissions"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ManageFundsDialog({
  admin,
  open,
  onOpenChange,
}: {
  admin: AdminAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [fundIds, setFundIds] = useState<number[]>(
    admin.funds.map((fund) => fund.id)
  )
  const update = useUpdateAdminFunds()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    update.mutate(
      { email: admin.email, fundIds },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage fund access</DialogTitle>
          <DialogDescription>
            {admin.is_super_admin
              ? "Super admins can access every fund."
              : `${admin.name} can only see the selected funds.`}
          </DialogDescription>
        </DialogHeader>

        <form id="manage-funds-form" onSubmit={onSubmit}>
          <FundPicker selected={fundIds} onChange={setFundIds} />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="manage-funds-form"
            disabled={update.isPending || admin.is_super_admin}
          >
            {update.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save fund access"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChangeRoleDialog({
  admin,
  open,
  onOpenChange,
  isSelf,
}: {
  admin: AdminAccount
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelf: boolean
}) {
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    admin.is_super_admin ? "SUPER_ADMIN" : "ADMIN"
  )
  const update = useUpdateAdminRole()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    update.mutate(
      { email: admin.email, role },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            {admin.name} · {admin.email}
          </DialogDescription>
        </DialogHeader>

        <form id="change-role-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="admin-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "ADMIN" | "SUPER_ADMIN")
                }
                disabled={isSelf}
              >
                <SelectTrigger id="admin-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super admin</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && (
                <FieldDescription>
                  You cannot change your own role.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="change-role-form"
            disabled={update.isPending || isSelf}
          >
            {update.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              "Save role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
