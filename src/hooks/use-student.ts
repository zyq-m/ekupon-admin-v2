import { studentAPI, type UpdateBalanceBody } from "@/api/student"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
