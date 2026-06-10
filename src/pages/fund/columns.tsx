/* eslint-disable react-hooks/rules-of-hooks */
import type { Fund, FundInput } from "@/api/fund"
import ActionDropdown from "@/components/action-dropdown"
import FundFormDialog from "@/components/form/fund-form"
import { SortableHeader } from "@/components/sortable-header"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useUpdateFund } from "@/hooks/use-fund"
import { formatDate, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Link } from "react-router-dom"

export const columns: ColumnDef<Fund>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fund / Coupon" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <SortableHeader column={column} title="Initial Amount" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.amount)}</div>,
  },
  {
    accessorKey: "start_use",
    header: ({ column }) => (
      <SortableHeader column={column} title="Effective Date" />
    ),
    cell: ({ row }) => <div>{formatDate(row.original.start_use)}</div>,
  },
  {
    accessorKey: "expired",
    header: ({ column }) => <SortableHeader column={column} title="Expired" />,
    cell: ({ row }) => <div>{formatDate(row.original.expired)}</div>,
  },
  {
    accessorKey: "limit_spend",
    header: ({ column }) => (
      <SortableHeader column={column} title="Limit / Day" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.limit_spend)}</div>,
  },
  {
    accessorKey: "limit_per_tf",
    header: ({ column }) => (
      <SortableHeader column={column} title="Limit / Trans" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.limit_per_tf)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fund = row.original
      const [open, setOpen] = useState(false)

      const update = useUpdateFund()

      const onSubmit = (input: FundInput) => {
        update.mutate(
          { id: fund.id, input },
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
              <Link to={`/ekupon-admin/coupon/${fund.id}`}>View</Link>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => setOpen(true)}>
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </ActionDropdown>

          <FundFormDialog
            title="Edit fund"
            desc="Update the fund information"
            fund={fund}
            isOpen={open}
            setOpen={setOpen}
            onSubmit={onSubmit}
          />
        </>
      )
    },
  },
]
