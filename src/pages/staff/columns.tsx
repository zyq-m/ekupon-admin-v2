/* eslint-disable react-hooks/rules-of-hooks */
import type {
  StaffProfile,
  StaffUploadComparison,
  TfStaff,
  TStaff,
} from "@/api/staff"
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
import { useSetCouponStatus } from "@/hooks/use-fund"
import { useUpdateStaff } from "@/hooks/use-staff"
import { cn, formatDate, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { useState } from "react"
import { Link } from "react-router-dom"
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
              updateStaffData(row.original, {
                ...updated,
                ptj: staff.uploaded.ptj,
              })
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
            <DropdownMenuItem asChild>
              <Link to={`/ekupon-admin/staff/${row.original.email}`}>
                View
              </Link>
            </DropdownMenuItem>
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

export const staffTfCol: ColumnDef<TfStaff>[] = [
  {
    id: "cafe_name",
    accessorFn: ({ cafe }) => cafe.cafe_name,
    header: "Recipient",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ row }) => <div>{formatRM(row.original.amount)}</div>,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Date & Time" />
    ),
    cell: ({ row }) => (
      <div>{dayjs(row.original.timestamp).format("DD/MM/YYYY hh:mm a")}</div>
    ),
  },
]

export const staffCouponCol: ColumnDef<StaffProfile["coupons"][0]>[] = [
  {
    id: "fund_name",
    accessorFn: ({ fund }) => fund.name,
    header: "Fund / Coupon",
  },
  {
    id: "initAmount",
    accessorFn: ({ fund }) => fund.amount,
    header: ({ column }) => (
      <SortableHeader column={column} title="Initial Amount" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.fund.amount)}</div>,
  },
  {
    accessorKey: "balance",
    header: ({ column }) => <SortableHeader column={column} title="Balance" />,
    cell: ({ row }) => <div>{formatRM(row.original.balance)}</div>,
  },
  {
    id: "expired",
    accessorFn: ({ fund }) => fund.expired,
    header: ({ column }) => <SortableHeader column={column} title="Expired" />,
    cell: ({ row }) => <div>{formatDate(row.original.fund.expired)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original
      const isActive = coupon.is_active
      const status = useSetCouponStatus()

      return (
        <ActionDropdown>
          <DropdownMenuItem
            variant={isActive ? "destructive" : "default"}
            onClick={() =>
              status.mutate(
                {
                  type: "staff",
                  id: coupon.id,
                  is_active: !isActive,
                },
                {
                  onSuccess: () =>
                    toast.success(
                      isActive ? "Coupon deactivated" : "Coupon activated"
                    ),
                }
              )
            }
          >
            {isActive ? "Deactivate" : "Activate Coupon"}
          </DropdownMenuItem>
        </ActionDropdown>
      )
    },
  },
]
