import type { Cafe } from "@/api/cafe"
import DataTable from "@/components/data-table"
import { BulkCouponAmountDialog } from "@/components/form/bulk-coupon-amount-form"
import { FundSummaryCards } from "@/components/fund-summary-card"
import { SelectFunds } from "@/components/select-funds"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuspendUser } from "@/hooks/use-auth"
import { useGetCafe } from "@/hooks/use-cafe"
import { useGetFundById } from "@/hooks/use-fund"
import { useCreateBulkTransaction } from "@/hooks/use-transaction"
import type { CouponRow } from "@/pages/coupon/columns"
import { zodResolver } from "@hookform/resolvers/zod"
import { CirclePlus, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { z } from "zod"
import { columns } from "./columns"

const transFormSchema = z.object({
  cafeId: z.string().min(1, "Cafe is required"),
  amount: z
    .number({ message: "Amount is required" })
    .min(1, "Amount must be > 0"),
  date: z.string().min(1, "Date is required"),
})

type TransFormValues = z.infer<typeof transFormSchema>

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function ViewCouponPage() {
  const { id } = useParams<{ id: string }>()
  const [fundId, setFundId] = useState<number | undefined>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [bulkAmountOpen, setBulkAmountOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<CouponRow[]>([])
  const [cafeValue, setCafeValue] = useState<string | null>(null)
  const resetSelectionRef = useRef<() => void>(() => {})

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setFundId(Number(id))
  }, [id])

  const { data, isLoading } = useGetFundById(fundId)
  const suspend = useSuspendUser()
  const { data: cafes } = useGetCafe()
  const createBulk = useCreateBulkTransaction()

  const form = useForm<TransFormValues>({
    resolver: zodResolver(transFormSchema),
    defaultValues: {
      cafeId: "",
      amount: undefined,
      date: "",
    },
  })

  const onSelectCafe = (name: string | null) => {
    const cafe = cafes?.find((c) => c.cafe_name === name)
    if (cafe) {
      setCafeValue(name)
      form.setValue("cafeId", cafe.id)
      form.clearErrors("cafeId")
    }
  }

  const onSubmit = (values: TransFormValues) => {
    const icNos = selectedStudents
      .map((s) => s.student?.ic_no)
      .filter(Boolean) as string[]

    if (icNos.length === 0) return

    createBulk.mutate(
      {
        fundId: Number(id),
        students: icNos,
        cafeId: values.cafeId,
        date: values.date,
        amount: values.amount,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          setSelectedStudents([])
          setCafeValue(null)
          form.reset()
          resetSelectionRef.current()
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      {isLoading ? <SummarySkeleton /> : data && <FundSummaryCards {...data} />}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns({ suspend })}
          data={data?.coupons || []}
          colName="name"
          placeholder="Name"
          selectionActions={(selected, resetSelection) => {
            resetSelectionRef.current = resetSelection
            return (
              <>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setSelectedStudents(selected)
                    setBulkAmountOpen(true)
                  }}
                >
                  Update balance
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setSelectedStudents(selected)
                    setSheetOpen(true)
                  }}
                >
                  <CirclePlus />
                  Create {selected.length} transactions
                </Button>
              </>
            )
          }}
        >
          <div className="flex gap-2">
            <SelectFunds value={data?.name} onValueChange={setFundId} />
          </div>
        </DataTable>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create Transaction</SheetTitle>
            <SheetDescription>
              {selectedStudents.length} student(s) selected
            </SheetDescription>
          </SheetHeader>

          <form
            id="bulk-trans-form"
            // eslint-disable-next-line react-hooks/refs
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 p-4"
          >
            <FieldGroup>
              <Controller
                name="cafeId"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cafe-select">Cafe</FieldLabel>
                    <Combobox
                      value={cafeValue}
                      onValueChange={onSelectCafe}
                      items={cafes}
                    >
                      <ComboboxInput
                        id="cafe-select"
                        placeholder="Select a cafe"
                        aria-invalid={fieldState.invalid}
                      />
                      <ComboboxContent className="z-50">
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(cafe: Cafe) => (
                            <ComboboxItem key={cafe.id} value={cafe.cafe_name}>
                              {cafe.cafe_name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="amount">Amount (RM)</FieldLabel>
                    <Input
                      {...field}
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Input
                      {...field}
                      id="date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <SheetFooter>
            <Button
              type="submit"
              form="bulk-trans-form"
              className="w-full"
              disabled={createBulk.isPending}
            >
              {createBulk.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${selectedStudents.length} Transaction(s)`
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <BulkCouponAmountDialog
        open={bulkAmountOpen}
        onOpenChange={setBulkAmountOpen}
        coupons={selectedStudents}
        studentCount={selectedStudents.length}
        onSuccess={() => {
          setSelectedStudents([])
          resetSelectionRef.current()
        }}
      />
    </div>
  )
}
