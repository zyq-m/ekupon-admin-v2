import { cafeAPI, type UpdateCafeInput } from "@/api/cafe"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useGetCafe() {
  return useQuery({
    queryKey: ["cafe"],
    queryFn: cafeAPI.listCafe,
  })
}

export function useGetCafeById(id: string) {
  return useQuery({
    queryKey: ["cafe", id],
    queryFn: () => cafeAPI.getCafeById(id),
  })
}

export function useUpdateCafe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ...cafe }: UpdateCafeInput & { id: string }) =>
      cafeAPI.updateCafe(cafe),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cafe"] })
      queryClient.invalidateQueries({ queryKey: ["cafe", res.cafe.id] })

      toast(res.message)
    },
  })
}
