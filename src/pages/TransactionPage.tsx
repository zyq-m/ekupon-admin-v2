import type { TfParams } from "@/api/transaction"
import DataTable from "@/components/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { MetricCard } from "@/components/MetricCard"
import { SelectFunds } from "@/components/select-funds"
import { TableTooltipsBtn } from "@/components/table-tooltip-btn"
import TransactionReportTable from "@/components/trans-report-table"
import { Button } from "@/components/ui/button"
import { useGetCafeTf } from "@/hooks/use-transaction"
import { formatNumber, formatRM } from "@/lib/utils"
import { BadgeDollarSign, Receipt, Search } from "lucide-react"
import { useState } from "react"
import { cafeTransactionCol } from "./cafe/columns"

export function TransactionPage() {
  const [tfPayload, setPayload] = useState<TfParams>({
    fundId: 0,
    from: "",
    to: "",
  })
  const { data, refetch } = useGetCafeTf(tfPayload)

  const onFilter = (newFilter: Partial<TfParams>) => {
    setPayload((prev) => ({ ...prev, ...newFilter }))
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
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
      {/* Main table + filter bar */}
      <DataTable
        columns={cafeTransactionCol}
        data={data?.transactions || []}
        colName="cafe_name"
        placeholder="Search for Company Name"
      >
        <div className="flex flex-wrap gap-2">
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
