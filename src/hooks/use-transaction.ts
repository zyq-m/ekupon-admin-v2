import { tfAPI, type StudentTfParams, type TfParams } from "@/api/transaction"
import { useQuery } from "@tanstack/react-query"

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
