import type { TfParams } from "@/api/transaction"
import DataTable from "@/components/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { MetricCard } from "@/components/MetricCard"
import { SelectFunds } from "@/components/select-funds"
import { TableTooltipsBtn } from "@/components/table-tooltip-btn"
import TransactionReportTable from "@/components/trans-report-table"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useGetCafeTf,
  useGetDirectedTf,
  useVoidDirectedTf,
} from "@/hooks/use-transaction"
import { formatNumber, formatRM } from "@/lib/utils"
import { BadgeDollarSign, Receipt, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { cafeTransactionCol } from "./cafe/columns"

type Mode = "normal" | "directed"

export function TransactionPage() {
  const [mode, setMode] = useState<Mode>("normal")
  const [tfPayload, setPayload] = useState<TfParams>({
    fundId: 0,
    from: "",
    to: "",
  })
  const cafeQuery = useGetCafeTf(tfPayload)
  const directedQuery = useGetDirectedTf(tfPayload)
  const voidMutation = useVoidDirectedTf()

  const data = mode === "normal" ? cafeQuery.data : directedQuery.data
  const refetch = mode === "normal" ? cafeQuery.refetch : directedQuery.refetch

  const onFilter = (newFilter: Partial<TfParams>) => {
    setPayload((prev) => ({ ...prev, ...newFilter }))
  }

  return (
    <div className="space-y-4">
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Transaction"
            value={formatNumber(data.summary.totalTf)}
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Total Amount"
            value={formatRM(data.summary.totalAmount)}
            icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}
      <DataTable
        columns={cafeTransactionCol}
        data={data?.transactions || []}
        colName="cafe_name"
        placeholder="Search for Company Name"
        selectionActions={
          mode === "directed"
            ? (selected, resetSelection) => {
                const cafeIds = selected.map((r) => r.id)
                const totalTrans = selected.reduce(
                  (s, r) => s + r.totalTransaction,
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
                          transaction(s) and restore coupon balances. This
                          action cannot be undone.
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
                                fundId: tfPayload.fundId,
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
              }
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="directed">Directed</TabsTrigger>
            </TabsList>
          </Tabs>
          <SelectFunds onValueChange={(e) => onFilter({ fundId: e })} />
          <DateRangeFilter onUpdate={(e) => onFilter(e)} />
          <TableTooltipsBtn tips="Find transaction">
            <Button onClick={() => refetch()}>
              <Search />
            </Button>
          </TableTooltipsBtn>

          <TransactionReportTable data={data} tfPayload={tfPayload} />
        </div>
      </DataTable>
    </div>
  )
}
