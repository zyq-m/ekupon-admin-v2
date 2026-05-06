import type { Student } from "@/api/student"
import type { TfComplete } from "@/api/transaction"
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
import { cn, formatDate, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { useState } from "react"
import { Link } from "react-router-dom"

type Meta = {
  suspend: ReturnType<typeof useSuspendUser>
}

export const columns = ({ suspend }: Meta): ColumnDef<Student>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
  },
  { accessorKey: "matric_no", header: "Matric No." },
  { accessorKey: "ic_no", header: "IC No." },
  {
    accessorKey: "user.is_active",
    header: "Status",
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
    id: "balance",
    accessorFn: (row) => row.coupons[0].balance,
    header: ({ column }) => <SortableHeader column={column} title="Balance" />,
    cell: ({ row }) => <div>{formatRM(row.original.coupons[0].balance)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isActive = row.original.user.is_active
      const coupon = row.original.coupons[0]
      const student = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false)

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
              <Link
                to={`/ekupon-admin/student/${row.original.ic_no}/${row.original.coupons[0].fund_id}`}
              >
                View
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setOpen(true)}>
              Edit balance
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
            studentName={student.name}
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

export const studentTfCol: ColumnDef<TfComplete>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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

export const studentCouponCol: ColumnDef<Student["coupons"][0]>[] = [
  {
    id: "fund_name",
    accessorFn: ({ fund }) => fund.name,
    header: "Fund / Coupon",
  },
  {
    id: "initAmount",
    accessorFn: ({ fund }) => fund.amount,
    header: ({ column }) => (
      <SortableHeader column={column} title="Intital Amount" />
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
    accessorFn: ({ fund: { expired } }) => expired,
    header: ({ column }) => <SortableHeader column={column} title="Expired" />,
    cell: ({ row }) => <div>{formatDate(row.original.fund.expired)}</div>,
  },
]
