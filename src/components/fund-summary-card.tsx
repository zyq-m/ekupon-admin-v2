import type { FundSummary } from "@/api/fund"
import { MetricCard } from "@/components/MetricCard"
import { formatRM } from "@/lib/utils"
import { Landmark, TrendingUp, Wallet } from "lucide-react"

export function FundSummaryCards(props: FundSummary) {
  const { totalFund, totalExpenses, balance } = props

  return (
    <div className="space-y-4">
      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
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
    </div>
  )
}
