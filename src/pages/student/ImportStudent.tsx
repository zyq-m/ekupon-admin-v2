import type {
  StudentUploadComparison,
  StudentUploadResponse,
} from "@/api/student"
import DataTable from "@/components/data-table"
import { FundFormTriggerBtn } from "@/components/form/fund-form"
import { SelectFunds } from "@/components/select-funds"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetCafe } from "@/hooks/use-cafe"
import {
  useBulkUploadXlsx,
  useCheckStudentUpload,
  useUpdateStudent,
} from "@/hooks/use-student"
import { useCreateBulkTransaction } from "@/hooks/use-transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { CirclePlus, Loader2, Upload } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"
import { comparisonCol } from "./columns"
import { ConflictTable } from "./ConflictTable"

import type { Cafe } from "@/api/cafe"
import { StudentSearchDialog } from "@/components/form/student-form"

const transFormSchema = z.object({
  cafeId: z.string().min(1, "Cafe is required"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
})

type TransFormValues = z.infer<typeof transFormSchema>

export function ImportStudent() {
  const [file, setFile] = useState<File | null>(null)
  const [fundId, setFundId] = useState<number | null>(null)
  const [uploadType, setUploadType] = useState<"normal" | "MMS">("normal")
  const [isDragOver, setIsDragOver] = useState(false)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState("0")
  const [tableData, setTableData] = useState<StudentUploadResponse["students"]>(
    []
  )
  const [selectedStudents, setSelectedStudents] = useState<
    StudentUploadComparison[]
  >([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const resetSelectionRef = useRef<() => void>(() => {})

  const { data: cafes } = useGetCafe()
  const createBulkTransaction = useCreateBulkTransaction()

  const form = useForm<TransFormValues>({
    resolver: zodResolver(transFormSchema),
    defaultValues: {
      cafeId: "",
      date: "",
      amount: 0,
    },
  })

  const { handleSubmit } = form
  const [cafeValue, setCafeValue] = useState<string | null>(null)

  const onSelectCafe = (value: string | null) => {
    setCafeValue(value)
    if (value) {
      const cafe = cafes?.find((c) => c.cafe_name === value)
      if (cafe) {
        form.setValue("cafeId", cafe.id)
      }
    } else {
      form.setValue("cafeId", "")
    }
  }

  const onSubmit = () =>
    handleSubmit((values) => {
      if (!fundId) return
      createBulkTransaction.mutate(
        {
          fundId,
          students: selectedStudents.map((s) => s.uploaded.ic_no),
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
            toast.success("Direct transaction created")
          },
        }
      )
    })

  const checkUpload = useCheckStudentUpload()
  const bulkUploadXlsx = useBulkUploadXlsx()
  const update = useUpdateStudent()

  const processFile = useCallback(
    (f: File) => {
      if (!f.name.endsWith(".xlsx")) {
        alert("Please upload a .xlsx file only.")
        return
      }

      setFile(f)
      void (async () => {
        try {
          const buf = await f.arrayBuffer()
          const wb = XLSX.read(buf, { type: "array" })
          const names = wb.SheetNames ?? []
          setSheetNames(names)
          const sheet = names[0] ?? "0"
          setSelectedSheet(sheet)

          const formData = new FormData()
          formData.append("file", f)
          formData.append("sheet", String(names.indexOf(sheet)))
          if (uploadType === "MMS") {
            formData.append("type", "MMS")
          }

          checkUpload.mutate(formData, {
            onSuccess: (res) => {
              setTableData(res.students)
            },
          })
        } catch {
          setSheetNames([])
          setSelectedSheet("0")
          const formData = new FormData()
          formData.append("file", f)
          formData.append("sheet", "0")
          if (uploadType === "MMS") {
            formData.append("type", "MMS")
          }

          checkUpload.mutate(formData, {
            onSuccess: (res) => {
              setTableData(res.students)
            },
          })
        }
      })()
    },
    [checkUpload, uploadType]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (!f) return
    processFile(f)
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files?.[0] ?? null
    if (!f) return
    processFile(f)
  }

  // ✅ Update function for dialog
  const updateStudentData = useCallback(
    (
      student: StudentUploadComparison,
      updatedData: StudentUploadComparison["uploaded"]
    ) => {
      setTableData((prev) => {
        const rowIndex = prev.findIndex(
          (s) =>
            s.uploaded.ic_no === student.uploaded.ic_no &&
            s.uploaded.matric_no === student.uploaded.matric_no
        )
        if (rowIndex === -1) return prev
        const next = [...prev]
        next[rowIndex] = {
          ...next[rowIndex],
          uploaded: updatedData,
          differences: [],
          conflict: false,
        }
        return next
      })
    },
    []
  )

  const deleteStudent = useCallback((student: StudentUploadComparison) => {
    setTableData((prev) =>
      prev.filter(
        (s) =>
          !(
            s.uploaded.ic_no === student.uploaded.ic_no &&
            s.uploaded.matric_no === student.uploaded.matric_no
          )
      )
    )
  }, [])

  const onUpload = () => {
    const wb = XLSX.utils.book_new()
    const rows = tableData.map((s) => ({
      Name: s.uploaded.name,
      "Matric No.": s.uploaded.matric_no,
      "IC No.": s.uploaded.ic_no,
      Balance: s.uploaded.balance,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, String(fundId))
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" })
    const file = new File([buf], `${fundId}.xlsx`, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const formData = new FormData()
    formData.append("file", file)
    formData.append("sheet", "0")
    formData.append("fundId", String(fundId))
    if (uploadType === "MMS") {
      formData.append("type", "MMS")
    }

    bulkUploadXlsx.mutate(formData, {
      onSuccess: (res) => {
        setFile(null)
        setTableData([])
        toast.success(
          `${res.created} created, ${res.couponsAssigned} coupons assigned, ${res.total} total`
        )
      },
    })
  }

  const onSheetChange = (sheet: string) => {
    if (!file) return
    setSelectedSheet(sheet)
    setTableData([])
    const formData = new FormData()
    formData.append("file", file)
    formData.append("sheet", String(sheetNames.indexOf(sheet)))
    if (uploadType === "MMS") {
      formData.append("type", "MMS")
    }
    checkUpload.mutate(formData, {
      onSuccess: (res) => {
        setTableData(res.students)
      },
    })
  }

  const onCancel = () => {
    setFile(null)
    setTableData([])
    setSheetNames([])
    setSelectedSheet("0")
  }

  const conflictedData = useMemo(
    () => tableData.filter((s) => s.conflict),
    [tableData]
  )

  const handleResolve = useCallback(
    (
      student: StudentUploadComparison,
      resolved: StudentUploadComparison["uploaded"]
    ) => {
      update.mutate(
        { ...resolved, userId: student.existing!.user_id },
        {
          onSuccess: () => {
            updateStudentData(student, resolved)
            toast.success("Student updated")
          },
          onError: (error: AxiosError<{ message: string }>) => {
            const msg = error.response?.data?.message
            toast.error(msg || "Failed to update student")
          },
        }
      )
    },
    [update, updateStudentData]
  )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create New Student</h2>
          <p className="text-sm text-muted-foreground">
            Import Excel file to register students in bulk.
          </p>
        </div>

        <div className="flex gap-0">
          <Button
            type="button"
            variant={uploadType === "normal" ? "default" : "outline"}
            className="rounded-r-none"
            onClick={() => setUploadType("normal")}
          >
            Normal
          </Button>
          <Button
            type="button"
            variant={uploadType === "MMS" ? "default" : "outline"}
            className="rounded-l-none"
            onClick={() => setUploadType("MMS")}
          >
            MMS
          </Button>
        </div>

        <label
          htmlFor="excel-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : file
                ? "border-primary/50 bg-primary/[0.02]"
                : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          {checkUpload.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Checking file...
              </span>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : isDragOver ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                Drop your file here
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-gray-500" />
              <span className="text-sm text-gray-600">
                Click to upload or drag & drop your .xlsx file
                {uploadType === "MMS" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (MMS mode)
                  </span>
                )}
              </span>
            </div>
          )}
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {file && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {sheetNames.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sheet</span>
                <Select value={selectedSheet} onValueChange={onSheetChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setTableData([])
                  setSheetNames([])
                  setSelectedSheet("0")
                }}
              >
                Remove file
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {tableData.length > 0 && (
        <div>
          <Tabs defaultValue="all">
            <TabsList variant="line">
              <TabsTrigger value="all">
                All <Badge variant="secondary">{tableData.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="conflicts">
                Conflicts{" "}
                <Badge variant="destructive">{conflictedData.length}</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <DataTable
                columns={comparisonCol(updateStudentData, deleteStudent)}
                data={tableData}
                colName="name"
                placeholder="Search for Name"
                selectionActions={(selected, resetSelection) => {
                  resetSelectionRef.current = resetSelection
                  return (
                    <Button
                      variant={"secondary"}
                      disabled={!fundId}
                      onClick={() => {
                        setSelectedStudents(selected)
                        setSheetOpen(true)
                      }}
                    >
                      <CirclePlus />
                      Create {selected.length} transactions
                    </Button>
                  )
                }}
              >
                <div className="flex gap-2">
                  <SelectFunds onValueChange={setFundId} />
                  <FundFormTriggerBtn />
                </div>
              </DataTable>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={
                        !fundId ||
                        bulkUploadXlsx.isPending ||
                        conflictedData.length > 0
                      }
                    >
                      {bulkUploadXlsx.isPending ? "Uploading.." : "Upload"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Import New Students</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to create {tableData.length} new
                        student records?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onUpload}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
            <TabsContent value="conflicts">
              <div className="pt-4">
                <ConflictTable
                  data={conflictedData}
                  onResolve={handleResolve}
                  resolving={update.isPending}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
            onSubmit={onSubmit}
            className="flex-1 space-y-6 p-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="cafe-select">Cafe</FieldLabel>
                <Combobox
                  value={cafeValue}
                  onValueChange={onSelectCafe}
                  items={cafes ?? []}
                >
                  <ComboboxInput id="cafe-select" placeholder="Select a cafe" />
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
                {form.formState.errors.cafeId && (
                  <FieldError>
                    {form.formState.errors.cafeId.message}
                  </FieldError>
                )}
              </Field>

              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Input id="date" type="date" {...field} />
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
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
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
              disabled={createBulkTransaction.isPending || !fundId}
            >
              {createBulkTransaction.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <StudentSearchDialog />
    </div>
  )
}
