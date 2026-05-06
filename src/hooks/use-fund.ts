import {
  fundAPI,
  type Fund,
  type FundInput,
  type FundSummary,
} from "@/api/fund"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useGetFunds() {
  return useQuery({
    queryKey: ["fund"],
    queryFn: () => fundAPI.fundList(),
  })
}
export function useGetFundById(fundId: number | undefined) {
  return useQuery({
    // 1. Include fundId in the key to ensure cache uniqueness per ID
    queryKey: ["fund", fundId],

    // 2. Pass the ID to the API call
    queryFn: () => fundAPI.fund(fundId),

    // 3. (Optional) Only run if ID is valid
    enabled: !!fundId,
  })
}

export function useCreateFund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: FundInput) => fundAPI.createFund(input),
    onSuccess: (newFund: Fund) => {
      // Update list after create
      queryClient.setQueryData<Fund[]>(["fund"], (old) => {
        if (!old) return [newFund]
        return [...old, newFund]
      })

      // Optional: invalidate detail if you want fresh state
      queryClient.invalidateQueries({ queryKey: ["fund", newFund.id] })

      toast("New fund has been created")
    },
  })
}

export function useUpdateFund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: FundInput }) =>
      fundAPI.updateFund(id, input),
    onSuccess: (updatedFund: Fund) => {
      // Update list if it exists
      queryClient.setQueryData<Fund[]>(["fund"], (old) => {
        if (!old) return [updatedFund]
        return old.map((f) => (f.id === updatedFund.id ? updatedFund : f))
      })

      // Update detail cache
      queryClient.setQueryData<FundSummary>(["fund", updatedFund.id], (old) => {
        if (!old)
          return {
            ...updatedFund,
            totalFund: 0,
            totalExpenses: 0,
            balance: 0,
          }
        return { ...old, ...updatedFund }
      })

      // queryClient.invalidateQueries({ queryKey: ["fund"] })
      toast("Fund has been updated")
    },
  })
}
