import type { DirectedTfParams, DirectedTfSummary } from "@/api/transaction"
import DataTable from "@/components/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { MetricCard } from "@/components/MetricCard"
import { SortableHeader } from "@/components/sortable-header"
import { TableTooltipsBtn } from "@/components/table-tooltip-btn"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useGetDirectedTf, useVoidDirectedTf } from "@/hooks/use-transaction"
import { formatNumber, formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { BadgeDollarSign, Receipt, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

const directedCols: ColumnDef<DirectedTfSummary>[] = [
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
    id: "cafe_name",
    accessorFn: (row) => row.cafe.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Cafe" />
    ),
  },
  {
    id: "fund_name",
    accessorFn: (row) => row.fund.name,
    header: ({ column }) => (
      <SortableHeader column={column} title="Fund" />
    ),
  },
  {
    accessorKey: "rate_per_trans",
    header: ({ column }) => (
      <SortableHeader column={column} title="Rate / Trans" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.rate_per_trans)}</div>,
  },
  {
    accessorKey: "trans_count",
    header: ({ column }) => (
      <SortableHeader column={column} title="Trans Count" />
    ),
    cell: ({ row }) => (
      <div>{formatNumber(row.original.trans_count)}</div>
    ),
  },
  {
    id: "trans_sum",
    accessorFn: (row) => row.trans_sum,
    header: ({ column }) => (
      <SortableHeader column={column} title="Total (RM)" />
    ),
    cell: ({ row }) => <div>{formatRM(row.original.trans_sum)}</div>,
  },
]

export function DirectedTrans() {
  const [tfPayload, setPayload] = useState<DirectedTfParams>({
    from: "",
    to: "",
  })
  const { data, refetch } = useGetDirectedTf(tfPayload)
  const voidMutation = useVoidDirectedTf()

  const onFilter = (newFilter: Partial<DirectedTfParams>) => {
    setPayload((prev) => ({ ...prev, ...newFilter }))
  }

  const totals = useMemo(() => {
    if (!data || data.length === 0) return null
    return {
      trans_count: data.reduce((sum, r) => sum + r.trans_count, 0),
      trans_sum: data.reduce((sum, r) => sum + r.trans_sum, 0),
    }
  }, [data])

  return (
    <div className="space-y-4">
      {totals && (
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Transaction"
            value={formatNumber(totals.trans_count)}
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Total Amount"
            value={formatRM(totals.trans_sum)}
            icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}
      <DataTable
        columns={directedCols}
        data={data ?? []}
        colName="cafe_name"
        placeholder="Search for Cafe Name"
        selectionActions={(selected, resetSelection) => {
          const funds = new Set(selected.map((r) => r.fund.id))
          if (funds.size !== 1) return null

          const fundId = selected[0].fund.id
          const cafeIds = selected.map((r) => r.cafe.id)
          const totalTrans = selected.reduce(
            (s, r) => s + r.trans_count,
            0
          )

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  Void ({selected.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Void Selected Transactions
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently void {totalTrans} directed
                    transaction(s) and restore coupon balances. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      voidMutation.mutate(
                        {
                          from: tfPayload.from,
                          to: tfPayload.to,
                          fundId,
                          cafeIds,
                        },
                        { onSuccess: () => resetSelection() }
                      )
                    }}
                    disabled={voidMutation.isPending}
                  >
                    {voidMutation.isPending ? "Voiding..." : "Void"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }}
      >
        <div className="flex flex-wrap gap-2">
          <DateRangeFilter onUpdate={(e) => onFilter(e)} />
          <TableTooltipsBtn tips="Find transaction">
            <Button onClick={() => refetch()}>
              <Search />
            </Button>
          </TableTooltipsBtn>
        </div>
      </DataTable>
    </div>
  )
}
