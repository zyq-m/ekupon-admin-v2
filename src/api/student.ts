import api from "./client"
import type { Fund } from "./fund"

export const studentAPI = {
  getStudents: (fundId: number) =>
    api
      .get<StudentResponse>("/student", { params: { fundId } })
      .then((res) => res.data),
  getStudentById: (icNo: string) =>
    api.get<Student>(`/student/${icNo}`).then((res) => res.data),

  updateCouponBalance: (body: UpdateBalanceBody) =>
    api.put<UpdateBalanceRes>("/student/coupon", body).then((r) => r.data),

  checkLoad: (formData: FormData) =>
    api
      .post<StudentUploadResponse>("/student/check-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data),

  bulkUpsert: ({
    students,
    fundId,
  }: {
    students: StudentUploadComparison[]
    fundId: number
  }) =>
    api
      .post<BulkUpsertRes>("/student/bulk-upsert", { students, fundId })
      .then((r) => r.data),

  updateStudent: (updated: InputStudent) =>
    api
      .put<InputStudent>(`/student/${updated.ic_no}`, updated)
      .then((r) => r.data),

  searchStudents: (search: { searchTerm?: string; searchBy?: string }) =>
    api
      .get<TStudent[]>("/student/search", { params: search })
      .then((r) => r.data),
}

export type UpdateStudentError = {
  conflict: InputStudent
  message: string
}

export type InputStudent = {
  matric_no: string
  ic_no: string
  name: string
}

export type BulkUpsertRes = {
  created: number
  updated: number
  skipped: number
}

export type UpdateBalanceRes = {
  message: string
}

export type UpdateBalanceBody = {
  id: number
  balance: number
}

export type StudentResponse = Promise<Student[]>

export type Student = {
  coupons: {
    ic_no: string | null
    id: number
    balance: number
    fund_id: number
    fund: Fund
  }[]
} & TStudent

export type TStudent = {
  user: {
    is_active: boolean
  }
  ic_no: string
  user_id: number
  matric_no: string
  name: string
}

export interface StudentUploadComparison {
  uploaded: {
    matric_no: string
    ic_no: string
    name: string
  }
  exists: boolean
  existing?: {
    ic_no: string
    matric_no: string
    name: string
    user_id: number // From your Prisma schema
  }
  differences: string[] // Array of difference messages
  conflict: boolean
}

export interface StudentUploadResponse {
  students: StudentUploadComparison[]
  summary: {
    total: number
    new: number
    existing: number
    needsUpdate: number
  }
}
