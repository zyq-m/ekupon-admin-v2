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
  user: {
    is_active: boolean
  }
  coupons: {
    ic_no: string | null
    id: number
    balance: number
    fund_id: number
    fund: Fund
  }[]
} & {
  ic_no: string
  user_id: number
  matric_no: string
  name: string
}
