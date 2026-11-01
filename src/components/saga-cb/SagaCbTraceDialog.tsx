import type {
  SagaCbBatch,
  SagaCbEvent,
  SagaCbInbound,
  SagaCbPayment,
} from "@/api/saga-cb"
import {
  SagaCbBatchStatusBadge,
  SagaCbMatchStatusBadge,
  SagaCbPaymentStatusBadge,
} from "@/components/saga-cb/SagaCbStatusBadge"
import { TruncatedCell } from "@/components/truncated-cell"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetFunds } from "@/hooks/use-fund"
import { useSagaCbTrace } from "@/hooks/use-saga-cb"
import { formatDate, formatNumber, formatRM } from "@/lib/utils"
import dayjs from "dayjs"

type Props = {
  batchId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SagaCbTraceDialog({ batchId, open, onOpenChange }: Props) {
  const traceQuery = useSagaCbTrace(open ? batchId : null)
  const { data: funds } = useGetFunds()
  const trace = traceQuery.data

  const fundName = trace
    ? (funds?.find((fund) => fund.id === trace.fundId)?.name ??
      `Fund #${trace.fundId}`)
    : "-"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>
              {trace ? `Batch ${trace.batchRef}` : "Batch trace"}
            </DialogTitle>
            {trace && <SagaCbBatchStatusBadge status={trace.status} />}
          </div>
          <DialogDescription>
            Payments, SAGA inbound records, and events for this batch.
          </DialogDescription>
        </DialogHeader>

        {traceQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : traceQuery.isError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load the batch trace.
          </p>
        ) : !trace ? (
          <p className="text-sm text-muted-foreground">Batch not found.</p>
        ) : (
          <BatchTraceContent trace={trace} fundName={fundName} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function BatchTraceContent({
  trace,
  fundName,
}: {
  trace: SagaCbBatch
  fundName: string
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Fund" value={fundName} />
        <Detail
          label="Period"
          value={`${formatDate(trace.periodStart)} - ${formatDate(
            trace.periodEnd
          )}`}
        />
        <Detail label="Payees" value={formatNumber(trace.paymentCount)} />
        <Detail label="Total" value={formatRM(trace.totalAmount)} />
        <Detail
          label="Generated"
          value={dayjs(trace.generatedAt).format("DD/MM/YYYY hh:mm A")}
        />
        <Detail
          label="Uploaded"
          value={
            trace.uploadedAt
              ? dayjs(trace.uploadedAt).format("DD/MM/YYYY hh:mm A")
              : "-"
          }
        />
        <Detail label="File" value={trace.fileName} />
        <Detail label="SFTP path" value={trace.sftpPath ?? "-"} />
      </div>

      {trace.errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {trace.errorMessage}
        </p>
      )}

      <Tabs defaultValue="payments" className="space-y-3">
        <TabsList>
          <TabsTrigger value="payments">
            Payments ({trace.payments?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="inbound">
            Inbound ({trace.inbound?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="events">
            Events ({trace.events?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <PaymentsTable payments={trace.payments ?? []} />
        </TabsContent>
        <TabsContent value="inbound">
          <InboundTable inbound={trace.inbound ?? []} />
        </TabsContent>
        <TabsContent value="events">
          <EventsTable events={trace.events ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium" title={value}>
        {value}
      </p>
    </div>
  )
}

function PaymentsTable({ payments }: { payments: SagaCbPayment[] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Cafe</TableHead>
            <TableHead>Payee</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SAGA Voucher</TableHead>
            <TableHead>Paid At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-20 text-center">
                No payments.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.lineno}</TableCell>
                <TableCell>{payment.reference}</TableCell>
                <TableCell>{payment.cafeId}</TableCell>
                <TableCell>{payment.payeeName}</TableCell>
                <TableCell>{payment.accountNo}</TableCell>
                <TableCell>{payment.bankCode}</TableCell>
                <TableCell>{formatRM(payment.amount)}</TableCell>
                <TableCell>
                  <SagaCbPaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{payment.sagaVoucher ?? "-"}</TableCell>
                <TableCell>
                  {payment.sagaPaidAt
                    ? dayjs(payment.sagaPaidAt).format("DD/MM/YYYY hh:mm A")
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function InboundTable({ inbound }: { inbound: SagaCbInbound[] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Received</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Batch Ref</TableHead>
            <TableHead>Voucher</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>SAGA Status</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inbound.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-20 text-center">
                No inbound records.
              </TableCell>
            </TableRow>
          ) : (
            inbound.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {dayjs(record.receivedAt).format("DD/MM/YYYY hh:mm A")}
                </TableCell>
                <TableCell>
                  {record.sourceFile}:{record.lineNo}
                </TableCell>
                <TableCell>{record.batchRef}</TableCell>
                <TableCell>{record.voucher ?? "-"}</TableCell>
                <TableCell>{formatRM(record.amount)}</TableCell>
                <TableCell>{record.sagaStatus || "-"}</TableCell>
                <TableCell>
                  <SagaCbMatchStatusBadge status={record.matchStatus} />
                </TableCell>
                <TableCell>
                  <TruncatedCell cell={record.matchNote ?? "-"} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function EventsTable({ events }: { events: SagaCbEvent[] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-20 text-center">
                No events.
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  {dayjs(event.createdAt).format("DD/MM/YYYY hh:mm A")}
                </TableCell>
                <TableCell>{event.event}</TableCell>
                <TableCell>
                  <TruncatedCell cell={event.detail ?? "-"} />
                </TableCell>
                <TableCell>{event.paymentId ?? "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
