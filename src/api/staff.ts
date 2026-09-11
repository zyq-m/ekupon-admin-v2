import api from "./client"

export const staffAPI = {
  searchStaff: (search: { name?: string; email?: string; no_staff?: string }) =>
    api.get<TStaff[]>("/staff/search", { params: search }).then((r) => r.data),

  getStaffProfile: (email: string) =>
    api.get<StaffProfile>(`/staff/${email}`).then((r) => r.data),

  getStaffTf: (email: string) =>
    api
      .get<StaffTfRes>(`/transaction/staff/${email}`)
      .then((r) => r.data),

  listPtj: () => api.get<Ptj[]>("/lookup/ptj").then((r) => r.data),

  checkFile: (formData: FormData) =>
    api
      .post<StaffUploadResponse>("/staff/check-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  bulkUploadXlsx: (formData: FormData) =>
    api
      .post<BulkUpsertRes>("/staff/bulk-upsert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  updateStaff: (updated: InputStaff) =>
    api
      .post<InputStaff>(`/staff/${updated.userId}`, updated)
      .then((r) => r.data),
}

export type Ptj = {
  id: number
  ptj: string
}

export type InputStaff = {
  name: string
  email: string
  no_staff: string
  ptj_id?: number
  userId: number
}

export type BulkUpsertRes = {
  message?: string
  created: number
  couponsAssigned: number
  total: number
}

export type TStaff = {
  email: string
  user_id: number
  no_staff: string
  ptj: {
    ptj: string
  }
  name: string
  user: {
    is_active: boolean
    joined: string
  }
  _count: {
    coupons: number
  }
}

export interface StaffUploadComparison {
  uploaded: {
    name: string
    email: string
    no_staff: string
    ptj: string
  }
  exists: boolean
  existing: {
    email: string
    name: string
    no_staff: string
    user_id: number
  } | null
  differences: string[]
  conflict: boolean
}

export interface StaffUploadResponse {
  staff: StaffUploadComparison[]
  summary?: {
    total: number
    new: number
    existing: number
    needsUpdate: number
  }
  message?: string
}

export type StaffProfile = {
  ptj: {
    ptj: string
  }
  coupons: {
    fund: {
      id: number
      expired: Date
      name: string
      amount: number
      start_use: Date
      limit_spend: number
      limit_per_tf: number
      setup_by: string
    }
    email: string
    id: number
    balance: number
    is_active: boolean
    fund_id: number
  }[]
  email: string
  name: string
  user_id: number
  no_staff: string
  ptj_id: number
  user: {
    is_active: boolean
  }
}

export type StaffTfSender = {
  email: string
  name: string
  user_id: number
  no_staff: string
  ptj_id: number
}

export type StaffTfCafe = {
  end: Date | null
  id: string
  user_id: number
  cafe_name: string
  owner_name: string
  account_no: string
  no_tel: string | null
  bank_code: string
  premise: string | null
  registerNo: string | null
  start: Date | null
  total_earn: number
}

export type TfStaff = {
  staff: StaffTfSender
  cafe: StaffTfCafe
} & {
  email: string
  id: string
  fund_id: number
  cafe_id: string
  amount: number
  is_claim: boolean
  timestamp: Date
  claim_by: string | null
}

export type StaffTfRes = {
  transactions: TfStaff[]
  summary: {
    totalTf: number
    totalAmount: number | null
  }
}
