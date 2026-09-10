import {
  staffAPI,
  type BulkUpsertRes,
  type InputStaff,
} from "@/api/staff"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

export function useCheckStaffUpload() {
  return useMutation({
    mutationFn: (formData: FormData) => staffAPI.checkFile(formData),
    onError: (error: AxiosError<{ message: string }>) => {
      const apiErr = error.response?.data
      toast.error(apiErr?.message || "Failed to check file")
    },
  })
}

export function useBulkUploadStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => staffAPI.bulkUploadXlsx(formData),
    onSuccess: (res: BulkUpsertRes) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      if (res.message) {
        toast(res.message)
        return
      }
      toast.success(
        `${res.created} created, ${res.couponsAssigned} coupons assigned, ${res.total} total`
      )
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const apiErr = error.response?.data
      toast.error(apiErr?.message || "Upload failed")
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updated: InputStaff) => staffAPI.updateStaff(updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const apiErr = error.response?.data
      toast.error(apiErr?.message || "Failed to update staff")
    },
  })
}

export const useStaffSearch = ({
  searchTerm,
  searchBy,
}: {
  searchTerm?: string
  searchBy?: string
}) => {
  return useQuery({
    queryKey: ["staff", "search", { searchTerm, searchBy }],
    queryFn: () => staffAPI.searchStaff({ [searchBy!]: searchTerm! }),
    staleTime: 300_000,
    retry: 1,
    placeholderData: [],
  })
}