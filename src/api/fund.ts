// fund.ts

import api from "./client"

export type Fund = {
  id: number
  name: string
  expired: Date
  start_use: Date
  amount: number
  limit_spend: number
  limit_per_tf: number
  setup_by: string
}

export type FundSummary = Fund & {
  totalFund: number
  totalExpenses: number
  balance: number
  coupons: {
    id: number
    balance: number
    student: {
      name: string
      ic_no: string
      user_id: number
      matric_no: string
      user: {
        is_active: boolean
      }
    } | null
  }[]
}

// DTO for create/update; match your backend /fund POST/PUT body
export type FundInput = {
  name: string
  expired: string // ISO string
  start_use: string // ISO string
  amount: number
  limit_spend: number
  limit_per_tf: number
}

export type BalanceManyInput = {
  amount: number
  coupon_ids: number[]
}

export type BalanceManyRes = {
  count: number
}

export const fundAPI = {
  // List
  fundList: () => api.get<Fund[]>("/fund").then((r) => r.data),

  updateBalanceMany: (body: BalanceManyInput) =>
    api.put<BalanceManyRes>("/fund/balance-many", body).then((r) => r.data),

  // Detail
  fund: (fundId?: number) =>
    api
      .get<FundSummary>("/fund", {
        params: fundId ? { fundId } : {},
      })
      .then((r) => r.data),

  // Create new fund
  createFund: (input: FundInput) =>
    api.post<Fund>("/fund", input).then((r) => r.data),

  // Update existing fund (by id in body or path; adapt to your backend)
  updateFund: (id: number, input: FundInput) =>
    api.put<Fund>(`/fund`, { ...input, id }).then((r) => r.data),
  // or if backend expects `/fund/:id`, use `/fund/${id}` and send partial body
}
