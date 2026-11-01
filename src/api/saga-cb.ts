import api from "./client"

export type SagaCbBatchStatus =
  | "GENERATED"
  | "UPLOADED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"

export type SagaCbPaymentStatus =
  | "PENDING"
  | "UPLOADED"
  | "PAID"
  | "CANCELLED"
  | "FAILED"

export type SagaCbMatchStatus = "MATCHED" | "UNMATCHED" | "DUPLICATE"

export type SagaCbGenerateInput = {
  fundId: number
  from: string
  to: string
}

export type SagaCbEvent = {
  id: number
  batchId: number | null
  paymentId: number | null
  event: string
  detail: string | null
  createdAt: string
}

export type SagaCbInbound = {
  id: number
  sourceFile: string
  lineNo: number
  rawLine: string
  batchRef: string
  voucher: string | null
  amount: number
  sagaStatus: string
  txDate: string | null
  chequeNo: string | null
  cbtrSerial: string | null
  bank: string | null
  cancelDesc: string | null
  printDate: string | null
  batchId: number | null
  batch?: SagaCbBatch | null
  paymentId: number | null
  matchStatus: SagaCbMatchStatus
  matchNote: string | null
  receivedAt: string
}

export type SagaCbPayment = {
  id: number
  batchId: number
  cafeId: string
  lineno: number
  reference: string
  payeeName: string
  accountNo: string
  bankCode: string
  amount: number
  comment: string | null
  status: SagaCbPaymentStatus
  sagaVoucher: string | null
  sagaStatus: string | null
  sagaTxDate: string | null
  sagaPaidAt: string | null
  lastError: string | null
  createdAt: string
  updatedAt: string
  batch?: SagaCbBatch
  inbound?: SagaCbInbound[]
  events?: SagaCbEvent[]
}

export type SagaCbBatch = {
  id: number
  batchRef: string
  fundId: number
  periodStart: string
  periodEnd: string
  bank: string
  company: string
  type: string
  totalAmount: number
  paymentCount: number
  fileName: string
  filePath: string | null
  fileHash: string | null
  status: SagaCbBatchStatus
  sftpPath: string | null
  errorMessage: string | null
  generatedAt: string
  uploadedAt: string | null
  createdAt: string
  updatedAt: string
  payments?: SagaCbPayment[]
  inbound?: SagaCbInbound[]
  events?: SagaCbEvent[]
}

export type SagaCbGenerateResponse = {
  batch: SagaCbBatch & { payments: SagaCbPayment[] }
  filePath: string
  summary: {
    totalTransactions: number
    totalPayees: number
    totalAmount: number
  }
}

export type SagaCbUploadResponse = {
  message: string
  remotePath: string
}

export type SagaCbSyncError = {
  filename?: string
  lineNo?: number
  rawLine?: string
  message?: string
}

export type SagaCbSyncResponse = {
  files: number
  received: number
  matched: number
  applied: number
  unmatched: number
  duplicates: number
  errors: SagaCbSyncError[]
}

const LONG_RUNNING_TIMEOUT = 60_000
const SYNC_TIMEOUT = 120_000

export const sagaCbAPI = {
  generate: (input: SagaCbGenerateInput) =>
    api
      .post<SagaCbGenerateResponse>("/saga/cb-payments/generate", input, {
        timeout: LONG_RUNNING_TIMEOUT,
      })
      .then((res) => res.data),

  upload: (batchId: number) =>
    api
      .post<SagaCbUploadResponse>(
        `/saga/cb-payments/batches/${batchId}/upload`,
        undefined,
        { timeout: LONG_RUNNING_TIMEOUT }
      )
      .then((res) => res.data),

  listBatches: () =>
    api.get<SagaCbBatch[]>("/saga/cb-payments/batches").then((res) => res.data),

  getBatch: (batchId: number) =>
    api
      .get<SagaCbBatch>(`/saga/cb-payments/batches/${batchId}`)
      .then((res) => res.data),

  getBatchTrace: (batchId: number) =>
    api
      .get<SagaCbBatch>(`/saga/cb-payments/batches/${batchId}/trace`)
      .then((res) => res.data),

  listPayments: () =>
    api
      .get<SagaCbPayment[]>("/saga/cb-payments/payments")
      .then((res) => res.data),

  getPayment: (paymentId: number) =>
    api
      .get<SagaCbPayment>(`/saga/cb-payments/payments/${paymentId}`)
      .then((res) => res.data),

  listUnmatched: () =>
    api
      .get<SagaCbInbound[]>("/saga/cb-payments/inbound/unmatched")
      .then((res) => res.data),

  sync: () =>
    api
      .post<SagaCbSyncResponse>("/saga/cb-payments/sync", undefined, {
        timeout: SYNC_TIMEOUT,
      })
      .then((res) => res.data),
}
