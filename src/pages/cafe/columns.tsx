import type { Cafe, UpdateCafeInput } from "@/api/cafe"
import type { TfComplete, Transaction } from "@/api/transaction"
import ActionDropdown from "@/components/action-dropdown"
import { CafeFormDialog } from "@/components/form/cafe-form"
import { SortableHeader } from "@/components/sortable-header"
import { TruncatedCell } from "@/components/truncated-cell"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSuspendUser } from "@/hooks/use-auth"
import type { useUpdateCafe } from "@/hooks/use-cafe"
import { cn, formatDate, formatNumber, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { useState } from "react"
import { Link } from "react-router-dom"

type Meta = {
  suspend: ReturnType<typeof useSuspendUser>
  update: ReturnType<typeof useUpdateCafe>
}

export const columns = ({ suspend, update }: Meta): ColumnDef<Cafe>[] => [
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
    accessorKey: "cafe_name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Cafe Name" />
    ),
    cell: ({ row }) => {
      const cafeName = row.getValue("cafe_name") as string

      return <TruncatedCell cell={cafeName} />
    },
  },
  {
    accessorKey: "owner_name",
    header: "Owner",
  },
  {
    accessorKey: "no_tel",
    header: "No. Tel",
  },
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
    accessorKey: "premise",
    header: ({ column }) => (
      <SortableHeader column={column} title="Premise Address" />
    ),
    cell: ({ row }) => {
      const address = row.getValue("premise") as string

      return <TruncatedCell cell={address} />
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => <SortableHeader column={column} title="Start" />,
    cell: ({ row }) => {
      const date = row.original.start
      return <div>{date ? formatDate(date) : "-"}</div>
    },
  },
  {
    accessorKey: "end",
    header: ({ column }) => <SortableHeader column={column} title="End" />,
    cell: ({ row }) => {
      const date = row.original.end
      return <div>{date ? formatDate(date) : "-"}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isActive = row.original.user.is_active
      const id = row.original.id
      const cafe = row.original

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false)

      const onSuspend = () => {
        suspend.mutate({
          id: row.original.user_id,
          active: !isActive,
        })
      }

      const updateCafe = (input: UpdateCafeInput) => {
        update.mutate(
          { ...input, id },
          {
            onSuccess: () => {
              setOpen(false)
            },
          }
        )
      }

      return (
        <>
          <ActionDropdown>
            <DropdownMenuItem>
              <Link to={`/cafe/${id}`}>View profile</Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setOpen(true)}>
              Edit cafe
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant={isActive ? "destructive" : "default"}
              onClick={onSuspend}
            >
              {isActive ? "Suspend" : "Activate"}
            </DropdownMenuItem>
          </ActionDropdown>

          <CafeFormDialog
            onSubmit={updateCafe}
            title="Edit cafe"
            desc="Edit cafe's information"
            isOpen={open}
            setOpen={setOpen}
            cafe={cafe}
          />
        </>
      )
    },
  },
]

export const cafeTransactionCol: ColumnDef<Transaction>[] = [
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
    accessorKey: "cafe_name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Company Name" />
    ),
    cell: ({ row }) => <TruncatedCell cell={row.original.cafe_name} />,
  },
  {
    accessorKey: "premise",
    header: ({ column }) => (
      <SortableHeader column={column} title="Premise Address" />
    ),
    cell: ({ row }) => <TruncatedCell cell={row.original.premise} />,
  },
  {
    accessorKey: "owner_name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Owner/Founder" />
    ),
  },
  {
    accessorKey: "account_no",
    header: "Account No.",
  },
  {
    accessorKey: "bank",
    header: "Bank Name",
  },
  {
    accessorKey: "totalTransaction",
    header: ({ column }) => (
      <SortableHeader column={column} title="Total Trans" />
    ),
    cell: ({ row }) => <div>{formatNumber(row.original.totalTransaction)}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => <SortableHeader column={column} title="Total" />,
    cell: ({ row }) => <div>{formatRM(row.original.totalAmount)}</div>,
  },
]

export const cafeTfCol: ColumnDef<TfComplete>[] = [
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
    id: "student_name",
    accessorFn: ({ student }) => student.name,
    header: "Sender",
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
