import {
  tfAPI,
  type BulkCreateTfInput,
  type DirectedTfParams,
  type StudentTfParams,
  type TfParams,
  type VoidDirectedTfInput,
} from "@/api/transaction"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useGetCafeTf(tfParams: TfParams) {
  const { from, fundId, to } = tfParams

  return useQuery({
    queryKey: ["transaction", "cafe", fundId, from, to],
    queryFn: () => tfAPI.listTf(tfParams),
    enabled: !!fundId && !!from && !!to,
  })
}

export function useGetCafeByIdTf(tfParams: TfParams, cafeId: string) {
  const { from, fundId, to } = tfParams

  return useQuery({
    queryKey: ["transaction", "cafe", cafeId, fundId, from, to],
    queryFn: () => tfAPI.getCafeTf(tfParams, cafeId),
    enabled: !!fundId && !!from && !!to && !!cafeId,
  })
}

export function useGetStudentTf({ fundId, icNo }: StudentTfParams) {
  return useQuery({
    queryKey: ["transaction", "student", icNo, fundId],
    queryFn: () => tfAPI.getStudentTf({ fundId, icNo }),
    enabled: !!fundId && !!icNo,
  })
}

export function useGetDirectedTf(params: DirectedTfParams) {
  const { from, fundId, to } = params

  return useQuery({
    queryKey: ["transaction", "directed", fundId, from, to],
    queryFn: () => tfAPI.listDirectedTf(params),
    enabled: !!fundId && !!from && !!to,
  })
}

export function useVoidDirectedTf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: VoidDirectedTfInput) => tfAPI.voidDirectedTf(body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["transaction", "directed"] })
      toast(`${res.deleted} transaction(s) voided`)
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to void transactions"
      toast.error(message)
    },
  })
}

export function useCreateBulkTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BulkCreateTfInput) => tfAPI.createBulkTf(input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["transaction"] })
      toast(`${vars.students.length} transaction(s) created successfully`)
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create transactions"
      toast.error(message)
    },
  })
}
