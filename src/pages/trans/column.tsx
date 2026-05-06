import type { TfComplete } from "@/api/transaction"
import { SortableHeader } from "@/components/sortable-header"
import { Checkbox } from "@/components/ui/checkbox"
import { formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"

export const transCol: ColumnDef<TfComplete>[] = [
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Recipient / Cafe" />
    ),
  },
  {
    id: "student_name",
    accessorFn: ({ student }) => student.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Sender / Student" />
    ),
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
      <div>{dayjs(row.original.timestamp).format("DD/MM/YYYY hh:mma")}</div>
    ),
  },
]
