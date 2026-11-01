import {
  sagaCbAPI,
  type SagaCbGenerateInput,
  type SagaCbSyncResponse,
} from "@/api/saga-cb"
import { formatRM } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

function errorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  )
}

export function useSagaCbBatches() {
  return useQuery({
    queryKey: ["saga-cb", "batches"],
    queryFn: sagaCbAPI.listBatches,
  })
}

export function useSagaCbPayments() {
  return useQuery({
    queryKey: ["saga-cb", "payments"],
    queryFn: sagaCbAPI.listPayments,
  })
}

export function useSagaCbUnmatched(enabled = true) {
  return useQuery({
    queryKey: ["saga-cb", "unmatched"],
    queryFn: sagaCbAPI.listUnmatched,
    enabled,
  })
}

export function useSagaCbTrace(batchId: number | null) {
  return useQuery({
    queryKey: ["saga-cb", "trace", batchId],
    queryFn: () => sagaCbAPI.getBatchTrace(batchId as number),
    enabled: batchId != null,
  })
}

export function useGenerateSagaCb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SagaCbGenerateInput) => sagaCbAPI.generate(input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["saga-cb"] })
      toast.success(`Batch ${res.batch.batchRef} generated`, {
        description: `${res.summary.totalPayees} payee(s) · ${formatRM(
          res.summary.totalAmount
        )}`,
      })
    },
    onError: (error) => {
      toast.error(
        errorMessage(error, "Failed to generate the CB payment batch")
      )
    },
  })
}

export function useUploadSagaCb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: number) => sagaCbAPI.upload(batchId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["saga-cb"] })
      toast.success("Batch uploaded to SAGA", {
        description: res.remotePath,
      })
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to upload the batch"))
    },
  })
}

function syncDescription(res: SagaCbSyncResponse) {
  return `${res.received} received · ${res.matched} matched · ${res.unmatched} unmatched · ${res.duplicates} duplicate(s)`
}

export function useSyncSagaCb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sagaCbAPI.sync,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["saga-cb"] })
      toast.success("SAGA inbound sync completed", {
        description: syncDescription(res),
      })

      if (res.errors.length > 0) {
        toast.warning(`${res.errors.length} sync error(s)`, {
          description: "Open the browser console or server logs for details.",
        })
      }
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to sync SAGA inbound files"))
    },
  })
}
