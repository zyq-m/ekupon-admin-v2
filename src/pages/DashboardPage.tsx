import { MetricCard } from "@/components/MetricCard"

import { useGetData } from "@/hooks/use-dashboard"
import { formatNumber, formatRM } from "@/lib/utils"
import { TrendingUp, Users, Wallet } from "lucide-react"

import { TotalTransaction } from "@/components/chart/total-transaction"
import DataTable from "@/components/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "./fund/columns"
import { transCol } from "./trans/column"

export function DashboardPage() {
  const { data } = useGetData()

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 1. High-Level Financials */}
      <div className="yell grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Beneficiary Users"
          value={formatNumber(data.user)}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Funds Distributed"
          value={formatRM(data.totalDistributed)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Funds Spent"
          value={formatRM(data.totalSpent)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Remaining"
          value={formatRM(data.totalRemaining)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Transaction Chart */}
      <TotalTransaction />

      <Tabs defaultValue="fund" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fund">Recent Funds</TabsTrigger>
          <TabsTrigger value="transaction">Recent Transaction</TabsTrigger>
        </TabsList>

        <TabsContent value="fund">
          <DataTable columns={columns} data={data.funds} />
        </TabsContent>
        <TabsContent value="transaction">
          <DataTable columns={transCol} data={data.transactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
