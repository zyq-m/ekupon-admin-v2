/* eslint-disable react-hooks/rules-of-hooks */
import ActionDropdown from "@/components/action-dropdown"
import { CouponAmountDialog } from "@/components/form/coupon-amount-form"
import { SortableHeader } from "@/components/sortable-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useSetCouponStatus } from "@/hooks/use-fund"
import { cn, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export type CouponRow = {
  id: number
  balance: number
  is_active: boolean
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

export const columns = (): ColumnDef<CouponRow>[] => [
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
    accessorKey: "is_active",
    header: ({ column }) => (
      <SortableHeader column={column} title="Coupon Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge
          className={cn(
            isActive
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          )}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original
      const couponActive = coupon.is_active
      const [open, setOpen] = useState(false)
      const status = useSetCouponStatus()

      const onToggleCoupon = () => {
        status.mutate(
          {
            type: coupon.student ? "student" : "staff",
            id: coupon.id,
            is_active: !couponActive,
          },
          {
            onSuccess: () => {
              toast.success(
                couponActive ? "Coupon deactivated" : "Coupon activated"
              )
            },
          }
        )
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

            <DropdownMenuItem
              variant={couponActive ? "destructive" : "default"}
              onClick={onToggleCoupon}
            >
              {couponActive ? "Deactivate" : "Activate Coupon"}
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
