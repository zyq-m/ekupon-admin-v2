import api from "./client"

export const staffAPI = {
  searchStaff: (search: { name?: string; email?: string; no_staff?: string }) =>
    api.get<TStaff[]>("/staff/search", { params: search }).then((r) => r.data),

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

export type InputStaff = {
  name: string
  email: string
  no_staff: string
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
