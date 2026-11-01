import type {
  SagaCbBatchStatus,
  SagaCbMatchStatus,
  SagaCbPaymentStatus,
} from "@/api/saga-cb"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const batchStyles: Record<SagaCbBatchStatus, string> = {
  GENERATED:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  UPLOADED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  PARTIALLY_PAID:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  PAID: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  FAILED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

const paymentStyles: Record<SagaCbPaymentStatus, string> = {
  PENDING:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  UPLOADED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  PAID: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  FAILED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

const matchStyles: Record<SagaCbMatchStatus, string> = {
  MATCHED:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  UNMATCHED:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  DUPLICATE:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
}

const batchLabels: Record<SagaCbBatchStatus, string> = {
  GENERATED: "Generated",
  UPLOADED: "Uploaded",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  FAILED: "Failed",
}

const paymentLabels: Record<SagaCbPaymentStatus, string> = {
  PENDING: "Pending",
  UPLOADED: "Uploaded",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
}

const matchLabels: Record<SagaCbMatchStatus, string> = {
  MATCHED: "Matched",
  UNMATCHED: "Unmatched",
  DUPLICATE: "Duplicate",
}

export function SagaCbBatchStatusBadge({
  status,
}: {
  status: SagaCbBatchStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn(batchStyles[status] ?? "", "whitespace-nowrap")}
    >
      {batchLabels[status] ?? status}
    </Badge>
  )
}

export function SagaCbPaymentStatusBadge({
  status,
}: {
  status: SagaCbPaymentStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn(paymentStyles[status] ?? "", "whitespace-nowrap")}
    >
      {paymentLabels[status] ?? status}
    </Badge>
  )
}

export function SagaCbMatchStatusBadge({
  status,
}: {
  status: SagaCbMatchStatus
}) {
  return (
    <Badge
      variant="outline"
      className={cn(matchStyles[status] ?? "", "whitespace-nowrap")}
    >
      {matchLabels[status] ?? status}
    </Badge>
  )
}
