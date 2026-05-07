/* eslint-disable react-hooks/rules-of-hooks */
import type { Student, StudentUploadComparison, TStudent } from "@/api/student"
import type { TfComplete } from "@/api/transaction"
import ActionDropdown from "@/components/action-dropdown"
import { CouponAmountDialog } from "@/components/form/coupon-amount-form"
import { StudentConflictDialog } from "@/components/form/student-form"
import { SortableHeader } from "@/components/sortable-header"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSuspendUser } from "@/hooks/use-auth"
import { useUpdateStudent } from "@/hooks/use-student"
import { cn, formatDate, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { useState } from "react"
import { Link } from "react-router-dom"

type Meta = {
  suspend: ReturnType<typeof useSuspendUser>
}

type ColumnProps = {
  updateStudentData: (
    rowIndex: number,
    data: StudentUploadComparison["uploaded"]
  ) => void
  deleteStudent: (rowIndex: number) => void
}

export const comparisonCol = (
  updateStudentData: ColumnProps["updateStudentData"],
  deleteStudent: ColumnProps["deleteStudent"],
  update: ReturnType<typeof useUpdateStudent>
): ColumnDef<StudentUploadComparison>[] => [
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
    id: "name",
    accessorFn: ({ uploaded }) => uploaded.name,
    header: "Name",
    cell: ({ row }) => row.original.uploaded.name,
  },
  {
    id: "ic_no",
    header: "IC No.",
    cell: ({ row }) => row.original.uploaded.ic_no,
  },

  {
    id: "matric_no",
    header: "Matric No.",
    cell: ({ row }) => row.original.uploaded.matric_no,
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
      const student = row.original
      const [open, setOpen] = useState(false)

      return (
        <>
          <ActionDropdown>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteStudent(row.index)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </ActionDropdown>

          <StudentConflictDialog
            isOpen={open}
            setIsOpen={setOpen}
            student={student}
            onSave={(updated) => {
              update.mutate(updated, {
                onSuccess: () => {
                  updateStudentData(row.index, updated)
                },
              })
            }}
          />
        </>
      )
    },
  },
]

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

export const columnSimple = ({ suspend }: Meta): ColumnDef<TStudent>[] => [
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
    id: "actions",
    cell: ({ row }) => {
      const isActive = row.original.user.is_active

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
              <Link to={`/ekupon-admin/student/${row.original.ic_no}`}>
                View
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant={isActive ? "destructive" : "default"}
              onClick={onSuspend}
            >
              {isActive ? "Suspend" : "Activate"}
            </DropdownMenuItem>
          </ActionDropdown>
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
