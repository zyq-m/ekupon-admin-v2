import DataTable from "@/components/data-table"
import { FundSummaryCards } from "@/components/fund-summary-card"
import { SelectFunds } from "@/components/select-funds"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuspendUser } from "@/hooks/use-auth"
import { useGetFundById } from "@/hooks/use-fund"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { columns } from "./columns"

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function ViewCouponPage() {
  const { id } = useParams<{ id: string }>()
  const [fundId, setFundId] = useState<number | undefined>()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setFundId(Number(id))
  }, [id])

  const { data, isLoading } = useGetFundById(fundId)
  const suspend = useSuspendUser()

  return (
    <div className="space-y-6">
      {isLoading ? <SummarySkeleton /> : data && <FundSummaryCards {...data} />}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns({ suspend })}
          data={data?.coupons || []}
          colName="name"
          placeholder="Search for Student Name"
        >
          <div className="flex gap-2">
            <SelectFunds value={data?.name} onValueChange={setFundId} />
          </div>
        </DataTable>
      )}
    </div>
  )
}
