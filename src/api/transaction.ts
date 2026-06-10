import type { Cafe } from "./cafe"
import api from "./client"
import type { Fund } from "./fund"
import type { Student } from "./student"

export type TfParams = {
  fundId: number
  from: string
  to: string
}

export type DirectedTfParams = {
  from: string
  to: string
}

export type StudentTfParams = { icNo: string; fundId: string }

export type VoidDirectedTfInput = {
  from: string
  to: string
  fundId: number
  cafeIds: string[]
}

export type BulkCreateTfInput = {
  fundId: number
  students: string[]
  cafeId: string
  date: string
  amount: number
}

export const tfAPI = {
  listTf: (tfParams: TfParams) =>
    api
      .get<CafeTfRes>("/transaction/cafe", { params: tfParams })
      .then((res) => res.data),

  getStudentTf: (tfParams: StudentTfParams) =>
    api
      .get<StudentTfRes>(`/transaction/student/${tfParams.icNo}`, {
        params: { fundId: tfParams.fundId },
      })
      .then((res) => res.data),

  getCafeTf: (tfParams: TfParams, cafeId: string) =>
    api
      .get<StudentTfRes>(`/transaction/cafe/${cafeId}`, { params: tfParams })
      .then((res) => res.data),

  createBulkTf: (input: BulkCreateTfInput) =>
    api.post("/transaction/direct", input).then((r) => r.data),

  listDirectedTf: (params: DirectedTfParams) =>
    api
      .get<DirectedTfSummary[]>("/transaction/directed", { params })
      .then((r) => r.data),

  voidDirectedTf: (body: VoidDirectedTfInput) =>
    api
      .post<{ deleted: number }>("/transaction/void-direct", body)
      .then((r) => r.data),
}

export type StudentTfRes = {
  transactions: TfComplete[]
} & Summary

export type TfComplete = {
  id: string
  amount: number
  cafe_id: string
  ic_no: string
  is_claim: boolean
  fund_id: number
  timestamp: Date
  claim_by: string | null
  cafe: Cafe
  student: Student
}

export type DateRange = {
  from: string
  to: string
}

export type Transaction = {
  id: string
  user_id: number
  cafe_name: string
  owner_name: string
  account_no: string
  no_tel: string
  bank: string
  premise: string
  registerNo: string | null
  start: string // ISO Date string
  end: string // ISO Date string
  total_earn: number
  totalTransaction: number
  totalAmount: number
}

export type DirectedTfSummary = {
  cafe: { id: string; name: string }
  fund: { id: number; name: string }
  rate_per_trans: number
  trans_count: number
  trans_sum: number
}

export type Summary = {
  totalTf: number
  totalAmount: number
}

export type CafeTfRes = {
  date: DateRange
  fund: Fund
  transactions: Transaction[]
  summary: Summary
}
