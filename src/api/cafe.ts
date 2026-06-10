import api from "./client"
import type { Fund } from "./fund"

export const cafeAPI = {
  listCafe: () => api.get<CafeResponse>("/cafe").then((res) => res.data),

  getCafeById: (id: string) =>
    api.get<TCafeProfile>(`/cafe/${id}`).then((res) => res.data),

  createCafe: (input: CreateCafeInput) =>
    api.post<UpdatedCafeRes>("/cafe", input).then((r) => r.data),

  bulkUploadCafe: (formData: FormData) =>
    api
      .post<BulkCafeUploadRes>("/cafe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  updateCafe: ({ ...cafe }: UpdateCafeInput & { id: string }) =>
    api.put<UpdatedCafeRes>(`/cafe/${cafe.id}`, cafe).then((r) => r.data),
}

export type BulkCafeUploadRes = { created: number; total: number; message: string }

export type CreateCafeInput = {
  cafeId: string
  cafe_name: string
  owner_name: string
  account_no: string
  no_tel: string
  bank: string
  start: string
  end: string
  premise: string
  registerNo: string
}

export type UpdatedCafeRes = { message: string; cafe: Cafe }

export type UpdateCafeInput = {
  cafe_name: string
  owner_name: string
  account_no: string
  bank: string
  no_tel?: string | undefined
  premise?: string | undefined
  registerNo?: string | undefined
  start?: string | undefined
  end?: string | undefined
}

export type CafeResponse = Promise<Cafe[]>

export type TCafeProfile = Cafe & {
  funds: Fund[]
}

export type Cafe = {
  user: {
    is_active: boolean
  }
} & {
  id: string
  user_id: number
  cafe_name: string
  owner_name: string
  account_no: string
  no_tel: string | null
  bank: string
  premise: string | null
  registerNo: string | null
  start: Date | null
  end: Date | null
  total_earn: number
}
