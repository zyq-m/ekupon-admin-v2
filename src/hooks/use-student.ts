import {
  studentAPI,
  type InputStudent,
  type StudentUploadComparison,
  type UpdateBalanceBody,
  type UpdateStudentError,
} from "@/api/student"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

export function useGetStudents(fundId?: number) {
  return useQuery({
    // 1. Include fundId in the queryKey so the cache updates when the ID changes
    queryKey: ["student", fundId],

    // 2. Only fetch when fundId is truthy (not undefined, null, or 0)
    queryFn: () => studentAPI.getStudents(fundId!),
    enabled: !!fundId,
  })
}

export function useGetStudentById(icNo: string) {
  return useQuery({
    queryKey: ["student", icNo],
    queryFn: () => studentAPI.getStudentById(icNo!),
    enabled: !!icNo,
  })
}

export function useUpdateCouponBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateBalanceBody) =>
      studentAPI.updateCouponBalance(body),
    onSuccess: () => {
      // refetch or invalidate your student / fund list
      queryClient.invalidateQueries({ queryKey: ["student"] })
    },
  })
}

export function useCheckStudentUpload() {
  return useMutation({
    mutationFn: (formData: FormData) => studentAPI.checkLoad(formData),
  })
}

export function useBulkUpsert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      students,
      fundId,
    }: {
      students: StudentUploadComparison[]
      fundId: number
    }) => studentAPI.bulkUpsert({ students, fundId }),
    onSuccess: (result) => {
      toast.success(
        `${result.created} created, ${result.updated} updated, ${result.skipped} skipped!`
      )
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
    onError: (error: AxiosError) => {
      const apiErr = error.response?.data
      toast.error(apiErr?.message)
    },
  })
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: (updated: InputStudent) => studentAPI.updateStudent(updated),
    onError: (error: AxiosError<UpdateStudentError>) => {
      const apiErr = error.response?.data
      toast.error(
        `Matric No "${apiErr?.conflict.matric_no}" already exists for ${apiErr?.conflict.name}`
      )
    },
  })
}

export const useStudentSearch = ({
  searchTerm,
  searchBy,
}: {
  searchTerm?: string
  searchBy?: string
}) => {
  return useQuery({
    queryKey: ["students", "search", { searchTerm, searchBy }],
    queryFn: () => studentAPI.searchStudents({ [searchBy!]: searchTerm! }),
    enabled: !!searchTerm && !!searchBy,
    staleTime: 300_000, // 5min
    retry: 1,
    placeholderData: [], // Empty array while loading
  })
}
