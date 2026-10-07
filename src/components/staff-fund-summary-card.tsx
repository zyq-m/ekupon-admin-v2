import type { FundSummary } from "@/api/fund"
import { MetricCard } from "@/components/MetricCard"
import { formatNumber, formatRM } from "@/lib/utils"
import { Landmark, TrendingUp, UserCog, Wallet } from "lucide-react"

export function StaffFundSummaryCards(props: FundSummary["staffAggregate"]) {
  const { count, totalFund, totalExpenses, balance } = props

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        title="Staff Coupons"
        value={formatNumber(count)}
        icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Total Fund"
        value={formatRM(totalFund)}
        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Total Expense"
        value={formatRM(totalExpenses)}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Current Balance"
        value={formatRM(balance)}
        icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}