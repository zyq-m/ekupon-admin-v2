import {
  cafeAPI,
  type CreateCafeInput,
  type UpdateCafeInput,
  type BulkCafeUploadRes,
} from "@/api/cafe"
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

export function useCreateCafe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCafeInput) => cafeAPI.createCafe(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cafe"] })
      toast(res.message)
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create cafe"
      toast.error(message)
    },
  })
}

export function useBulkUploadCafe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => cafeAPI.bulkUploadCafe(formData),
    onSuccess: (res: BulkCafeUploadRes) => {
      queryClient.invalidateQueries({ queryKey: ["cafe"] })
      toast(res.message || `${res.created} cafe(s) created`)
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Bulk upload failed"
      toast.error(message)
    },
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
