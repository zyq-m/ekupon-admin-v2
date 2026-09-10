/* eslint-disable react-hooks/rules-of-hooks */
import type { StaffUploadComparison, TStaff } from "@/api/staff"
import ActionDropdown from "@/components/action-dropdown"
import {
  EditStaffForm,
  StaffConflictDialog,
} from "@/components/form/staff-form"
import { SortableHeader } from "@/components/sortable-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSuspendUser } from "@/hooks/use-auth"
import { useUpdateStaff } from "@/hooks/use-staff"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

type Meta = {
  suspend: ReturnType<typeof useSuspendUser>
}

type ColumnProps = {
  updateStaffData: (
    staff: StaffUploadComparison,
    data: StaffUploadComparison["uploaded"]
  ) => void
  deleteStaff: (staff: StaffUploadComparison) => void
}

export const comparisonStaffCol = (
  updateStaffData: ColumnProps["updateStaffData"],
  deleteStaff: ColumnProps["deleteStaff"]
): ColumnDef<StaffUploadComparison>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "no_staff",
    header: "No Staff",
    cell: ({ row }) => row.original.uploaded.no_staff,
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => row.original.uploaded.name,
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => row.original.uploaded.email,
  },
  {
    accessorKey: "differences",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const diff = row.original.differences
      const conflict = row.original.conflict

      return (
        <Badge variant={conflict ? "destructive" : "secondary"}>
          {conflict ? `${diff.length} conflict` : "Perfect"}
        </Badge>
      )
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const staff = row.original
      const [open, setOpen] = useState(false)

      return (
        <>
          <ActionDropdown>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteStaff(row.original)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </ActionDropdown>

          <StaffConflictDialog
            isOpen={open}
            setIsOpen={setOpen}
            staff={staff}
            onSave={(updated) => {
              updateStaffData(row.original, updated)
              toast.success("Staff updated")
            }}
          />
        </>
      )
    },
  },
]

export const staffCol = ({ suspend }: Meta): ColumnDef<TStaff>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "no_staff",
    header: "No Staff",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorFn: (row) => row.ptj.ptj,
    id: "ptj",
    header: "PTJ",
  },
  {
    accessorKey: "user.is_active",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.user.is_active
      return (
        <Badge
          className={cn(
            isActive
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          )}
        >
          {isActive ? "Active" : "Suspended"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "_count.coupons",
    header: ({ column }) => <SortableHeader column={column} title="Coupons" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isActive = row.original.user.is_active
      const staff = row.original
      const [open, setOpen] = useState(false)
      const update = useUpdateStaff()

      const onSuspend = () => {
        suspend.mutate({
          id: row.original.user_id,
          active: !isActive,
        })
      }

      return (
        <>
          <ActionDropdown>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant={isActive ? "destructive" : "default"}
              onClick={onSuspend}
            >
              {isActive ? "Suspend" : "Activate"}
            </DropdownMenuItem>
          </ActionDropdown>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Staff</DialogTitle>
              </DialogHeader>
              <EditStaffForm
                staff={staff}
                onSave={(updated) => {
                  update.mutate(updated, {
                    onSuccess: () => {
                      toast.success("Staff updated")
                      setOpen(false)
                    },
                    onError: () => {
                      toast.error("Failed to update staff")
                    },
                  })
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
]
