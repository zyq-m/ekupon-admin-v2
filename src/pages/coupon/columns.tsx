/* eslint-disable react-hooks/rules-of-hooks */
import ActionDropdown from "@/components/action-dropdown"
import { CouponAmountDialog } from "@/components/form/coupon-amount-form"
import { SortableHeader } from "@/components/sortable-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSuspendUser } from "@/hooks/use-auth"
import { cn, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Link } from "react-router-dom"

export type CouponRow = {
  id: number
  balance: number
  student: {
    name: string
    ic_no: string
    user_id: number
    matric_no: string
    user: {
      is_active: boolean
    }
  } | null
}

type Meta = {
  suspend: ReturnType<typeof useSuspendUser>
}

export const columns = ({ suspend }: Meta): ColumnDef<CouponRow>[] => [
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
    id: "name",
    accessorFn: (row) => row.student?.name,
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => <div>{row.original.student?.name ?? "N/A"}</div>,
  },
  {
    id: "ic_no",
    accessorFn: (row) => row.student?.ic_no,
    header: ({ column }) => <SortableHeader column={column} title="IC No." />,
    cell: ({ row }) => <div>{row.original.student?.ic_no ?? "N/A"}</div>,
  },
  {
    id: "matric_no",
    accessorFn: (row) => row.student?.matric_no,
    header: ({ column }) => (
      <SortableHeader column={column} title="Matric No." />
    ),
    cell: ({ row }) => <div>{row.original.student?.matric_no ?? "N/A"}</div>,
  },
  {
    accessorKey: "balance",
    header: ({ column }) => <SortableHeader column={column} title="Balance" />,
    cell: ({ row }) => <div>{formatRM(row.original.balance)}</div>,
  },
  {
    accessorKey: "student.user.is_active",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.student?.user.is_active
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
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original
      const isActive = coupon.student?.user.is_active
      const [open, setOpen] = useState(false)

      const onSuspend = () => {
        if (!coupon.student) return
        suspend.mutate({
          id: coupon.student.user_id,
          active: !isActive,
        })
      }

      return (
        <>
          <ActionDropdown>
            <DropdownMenuItem asChild>
              <Link to={`/ekupon-admin/student/${coupon.student?.ic_no}`}>
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

          <CouponAmountDialog
            open={open}
            onOpenChange={setOpen}
            studentName={coupon.student?.name ?? "N/A"}
            coupon={{
              id: coupon.id,
              balance: coupon.balance,
            }}
          />
        </>
      )
    },
  },
]
