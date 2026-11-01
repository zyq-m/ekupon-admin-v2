import type { SagaCbBatch, SagaCbInbound, SagaCbPayment } from "@/api/saga-cb"
import ActionDropdown from "@/components/action-dropdown"
import {
  SagaCbBatchStatusBadge,
  SagaCbPaymentStatusBadge,
} from "@/components/saga-cb/SagaCbStatusBadge"
import { SortableHeader } from "@/components/sortable-header"
import { TruncatedCell } from "@/components/truncated-cell"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatNumber, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"

type BatchColumnMeta = {
  fundName: (fundId: number) => string
  canOperate: boolean
  onView: (batch: SagaCbBatch) => void
  onUpload: (batch: SagaCbBatch) => void
}

export function sagaBatchColumns({
  fundName,
  canOperate,
  onView,
  onUpload,
}: BatchColumnMeta): ColumnDef<SagaCbBatch>[] {
  return [
    {
      accessorKey: "batchRef",
      header: ({ column }) => (
        <SortableHeader column={column} title="Batch Ref" />
      ),
    },
    {
      id: "period",
      accessorFn: (row) => `${row.periodStart}-${row.periodEnd}`,
      header: "Period",
      cell: ({ row }) =>
        `${formatDate(row.original.periodStart)} - ${formatDate(
          row.original.periodEnd
        )}`,
    },
    {
      id: "fund",
      accessorFn: (row) => fundName(row.fundId),
      header: ({ column }) => <SortableHeader column={column} title="Fund" />,
    },
    {
      accessorKey: "paymentCount",
      header: ({ column }) => <SortableHeader column={column} title="Payees" />,
      cell: ({ row }) => <div>{formatNumber(row.original.paymentCount)}</div>,
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => <SortableHeader column={column} title="Total" />,
      cell: ({ row }) => <div>{formatRM(row.original.totalAmount)}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <SagaCbBatchStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "generatedAt",
      header: ({ column }) => (
        <SortableHeader column={column} title="Generated" />
      ),
      cell: ({ row }) => (
        <div>
          {dayjs(row.original.generatedAt).format("DD/MM/YYYY hh:mm A")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const batch = row.original
        const canUpload =
          batch.status === "GENERATED" || batch.status === "FAILED"

        return (
          <ActionDropdown>
            <DropdownMenuItem onSelect={() => onView(batch)}>
              View trace
            </DropdownMenuItem>

            {canOperate && canUpload && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onUpload(batch)}>
                  Upload to SAGA
                </DropdownMenuItem>
              </>
            )}
          </ActionDropdown>
        )
      },
    },
  ]
}

export const sagaPaymentColumns: ColumnDef<SagaCbPayment>[] = [
  {
    id: "batchRef",
    accessorFn: (row) => row.batch?.batchRef ?? "-",
    header: "Batch",
  },
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "cafeId",
    header: "Cafe ID",
  },
  {
    accessorKey: "payeeName",
    header: ({ column }) => <SortableHeader column={column} title="Payee" />,
    cell: ({ row }) => <TruncatedCell cell={row.original.payeeName} />,
  },
  {
    accessorKey: "accountNo",
    header: "Account No.",
  },
  {
    accessorKey: "bankCode",
    header: "Bank",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ row }) => <div>{formatRM(row.original.amount)}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <SagaCbPaymentStatusBadge status={row.original.status} />
    ),
  },
  {
    accessorKey: "sagaVoucher",
    header: "SAGA Voucher",
    cell: ({ row }) => <div>{row.original.sagaVoucher ?? "-"}</div>,
  },
  {
    accessorKey: "sagaPaidAt",
    header: "Paid At",
    cell: ({ row }) =>
      row.original.sagaPaidAt
        ? dayjs(row.original.sagaPaidAt).format("DD/MM/YYYY hh:mm A")
        : "-",
  },
]

export const sagaUnmatchedColumns: ColumnDef<SagaCbInbound>[] = [
  {
    accessorKey: "receivedAt",
    header: "Received",
    cell: ({ row }) => (
      <div>{dayjs(row.original.receivedAt).format("DD/MM/YYYY hh:mm A")}</div>
    ),
  },
  {
    accessorKey: "batchRef",
    header: "Batch Ref",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <div>{formatRM(row.original.amount)}</div>,
  },
  {
    accessorKey: "sagaStatus",
    header: "SAGA Status",
  },
  {
    accessorKey: "voucher",
    header: "Voucher",
    cell: ({ row }) => <div>{row.original.voucher ?? "-"}</div>,
  },
  {
    accessorKey: "matchNote",
    header: "Reason",
    cell: ({ row }) => (
      <TruncatedCell cell={row.original.matchNote ?? "No match"} />
    ),
  },
  {
    id: "source",
    accessorFn: (row) => `${row.sourceFile}:${row.lineNo}`,
    header: "Source",
    cell: ({ row }) => (
      <TruncatedCell
        cell={`${row.original.sourceFile}:${row.original.lineNo}`}
      />
    ),
  },
  {
    accessorKey: "rawLine",
    header: "Raw line",
    cell: ({ row }) => <TruncatedCell cell={row.original.rawLine} />,
  },
]
