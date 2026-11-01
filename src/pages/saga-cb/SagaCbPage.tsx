import type { SagaCbBatch } from "@/api/saga-cb"
import DataTable from "@/components/data-table"
import { MetricCard } from "@/components/MetricCard"
import { SagaCbTraceDialog } from "@/components/saga-cb/SagaCbTraceDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useGetFunds } from "@/hooks/use-fund"
import {
  useSagaCbBatches,
  useSagaCbPayments,
  useSagaCbUnmatched,
  useSyncSagaCb,
  useUploadSagaCb,
} from "@/hooks/use-saga-cb"
import { formatNumber, formatRM } from "@/lib/utils"
import { router } from "@/routes"
import {
  CheckCircle2,
  CircleDollarSign,
  Layers,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  sagaBatchColumns,
  sagaPaymentColumns,
  sagaUnmatchedColumns,
} from "./columns"

function parseBatchId(value: string | null) {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function SagaCbPage() {
  const { can, isSuperAdmin, admin } = useAuth()
  const canOperate = can("can_manage_balance")

  const [searchParams, setSearchParams] = useSearchParams()
  const [traceBatchId, setTraceBatchId] = useState<number | null>(() =>
    parseBatchId(searchParams.get("batch"))
  )
  const [uploadBatch, setUploadBatch] = useState<SagaCbBatch | null>(null)

  const batchesQuery = useSagaCbBatches()
  const paymentsQuery = useSagaCbPayments()
  const unmatchedQuery = useSagaCbUnmatched(canOperate)
  const fundsQuery = useGetFunds()
  const upload = useUploadSagaCb()
  const sync = useSyncSagaCb()

  const accessibleFundIds = useMemo(
    () => new Set(admin?.funds.map((fund) => fund.id) ?? []),
    [admin?.funds]
  )

  const fundMap = useMemo(
    () =>
      new Map(
        (fundsQuery.data ?? []).map((fund) => [fund.id, fund.name] as const)
      ),
    [fundsQuery.data]
  )

  const fundName = (fundId: number) => fundMap.get(fundId) ?? `Fund #${fundId}`

  const batches = useMemo(() => {
    const all = batchesQuery.data ?? []
    return isSuperAdmin
      ? all
      : all.filter((batch) => accessibleFundIds.has(batch.fundId))
  }, [batchesQuery.data, isSuperAdmin, accessibleFundIds])

  const payments = useMemo(() => {
    const all = paymentsQuery.data ?? []
    return isSuperAdmin
      ? all
      : all.filter(
          (payment) =>
            !!payment.batch && accessibleFundIds.has(payment.batch.fundId)
        )
  }, [paymentsQuery.data, isSuperAdmin, accessibleFundIds])

  const unmatched = useMemo(() => {
    const all = unmatchedQuery.data ?? []
    return isSuperAdmin
      ? all
      : all.filter(
          (record) =>
            !record.batch || accessibleFundIds.has(record.batch.fundId)
        )
  }, [unmatchedQuery.data, isSuperAdmin, accessibleFundIds])

  const summary = useMemo(() => {
    return {
      total: batches.length,
      awaiting: batches.filter(
        (batch) => batch.status === "GENERATED" || batch.status === "FAILED"
      ).length,
      partiallyPaid: batches.filter(
        (batch) => batch.status === "PARTIALLY_PAID"
      ).length,
      paidAmount: batches
        .filter((batch) => batch.status === "PAID")
        .reduce((sum, batch) => sum + batch.totalAmount, 0),
    }
  }, [batches])

  const closeTrace = (open: boolean) => {
    if (open) return
    setTraceBatchId(null)
    if (searchParams.has("batch")) {
      const next = new URLSearchParams(searchParams)
      next.delete("batch")
      setSearchParams(next, { replace: true })
    }
  }

  const batchColumns = sagaBatchColumns({
    fundName,
    canOperate,
    onView: (batch) => setTraceBatchId(batch.id),
    onUpload: setUploadBatch,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">SAGA CB Payments</h2>
          <p className="text-sm text-muted-foreground">
            Generate, upload, and track Cash Book payments sent to SAGA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canOperate && (
            <Button
              variant="outline"
              onClick={() => sync.mutate()}
              disabled={sync.isPending}
            >
              <RefreshCw className={sync.isPending ? "animate-spin" : ""} />
              {sync.isPending ? "Syncing..." : "Sync inbound"}
            </Button>
          )}
          {canOperate && (
            <Button
              onClick={() => router.navigate("/ekupon-admin/transaction")}
            >
              <Plus />
              Create CB Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Batches"
          value={formatNumber(summary.total)}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Awaiting upload"
          value={formatNumber(summary.awaiting)}
          icon={<UploadCloud className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Partially paid"
          value={formatNumber(summary.partiallyPaid)}
          icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Paid amount"
          value={formatRM(summary.paidAmount)}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          {canOperate && (
            <TabsTrigger value="unmatched">
              Unmatched
              {unmatched.length > 0 && (
                <Badge variant="secondary">{unmatched.length}</Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="batches">
          {batchesQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : batchesQuery.isError ? (
            <p className="text-sm text-destructive">Failed to load batches.</p>
          ) : (
            <DataTable
              columns={batchColumns}
              data={batches}
              colName="batchRef"
              placeholder="Search batch reference"
            />
          )}
        </TabsContent>

        <TabsContent value="payments">
          {paymentsQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : paymentsQuery.isError ? (
            <p className="text-sm text-destructive">Failed to load payments.</p>
          ) : (
            <DataTable
              columns={sagaPaymentColumns}
              data={payments}
              colName="payeeName"
              placeholder="Search payee"
            />
          )}
        </TabsContent>

        {canOperate && (
          <TabsContent value="unmatched">
            {unmatchedQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : unmatchedQuery.isError ? (
              <p className="text-sm text-destructive">
                Failed to load unmatched inbound records.
              </p>
            ) : (
              <DataTable
                columns={sagaUnmatchedColumns}
                data={unmatched}
                colName="batchRef"
                placeholder="Search batch reference"
              />
            )}
          </TabsContent>
        )}
      </Tabs>

      <SagaCbTraceDialog
        batchId={traceBatchId}
        open={traceBatchId !== null}
        onOpenChange={closeTrace}
      />

      <AlertDialog
        open={uploadBatch !== null}
        onOpenChange={(open) => {
          if (!open && !upload.isPending) setUploadBatch(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Upload batch {uploadBatch?.batchRef ?? ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This sends the generated file to SAGA via SFTP. Uploaded batches
              cannot be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={upload.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={upload.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (uploadBatch) {
                  upload.mutate(uploadBatch.id, {
                    onSuccess: () => setUploadBatch(null),
                  })
                }
              }}
            >
              {upload.isPending ? "Uploading..." : "Upload"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
