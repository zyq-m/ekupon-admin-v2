import api from "./client"
import type { Fund } from "./fund"
import type { TfComplete } from "./transaction"

export type DashboardRes = {
  user: number
  transactions: TfComplete[]
  funds: Fund[]
  totalDistributed: number
  totalSpent: number
  totalRemaining: number
}

export type TransactionChart = {
  date: Date | string
  count: number
  total_amount: number
}[]

export const dashboardAPI = {
  getDashboard: () => api.get<DashboardRes>("/dashboard").then((r) => r.data),

  getTotalTrans: (month: string) =>
    api
      .get<TransactionChart>("/dashboard/transaction", {
        params: { month: month },
      })
      .then((r) => r.data),
}
