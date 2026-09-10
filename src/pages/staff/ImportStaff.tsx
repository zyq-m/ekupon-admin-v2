import type { StaffUploadComparison } from "@/api/staff"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useBulkUploadStaff,
  useCheckStaffUpload,
  useUpdateStaff,
} from "@/hooks/use-staff"
import { Upload } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { comparisonStaffCol } from "./columns"
import { ConflictTable } from "./ConflictTable"

export function ImportStaff() {
  const [file, setFile] = useState<File | null>(null)
  const [fundId, setFundId] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [tableData, setTableData] = useState<StaffUploadComparison[]>([])

  const checkUpload = useCheckStaffUpload()
  const bulkUploadXlsx = useBulkUploadStaff()
  const update = useUpdateStaff()

  const processFile = useCallback(
    (f: File) => {
      if (!f.name.endsWith(".xlsx")) {
        toast.error("Please upload a .xlsx file only.")
        return
      }

      setFile(f)
      const formData = new FormData()
      formData.append("file", f)
      formData.append("sheet", "0")

      checkUpload.mutate(formData, {
        onSuccess: (res) => {
          setTableData(res.staff)
          if (res.message) {
            toast(res.message)
          }
        },
      })
    },
    [checkUpload]
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

  const updateStaffData = useCallback(
    (
      staff: StaffUploadComparison,
      updatedData: StaffUploadComparison["uploaded"]
    ) => {
      setTableData((prev) => {
        const rowIndex = prev.findIndex(
          (s) =>
            s.uploaded.email === staff.uploaded.email &&
            s.uploaded.no_staff === staff.uploaded.no_staff
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

  const deleteStaff = useCallback((staff: StaffUploadComparison) => {
    setTableData((prev) =>
      prev.filter(
        (s) =>
          !(
            s.uploaded.email === staff.uploaded.email &&
            s.uploaded.no_staff === staff.uploaded.no_staff
          )
      )
    )
  }, [])

  const onUpload = () => {
    const wb = XLSX.utils.book_new()
    const rows = tableData.map((s) => ({
      Name: s.uploaded.name,
      Email: s.uploaded.email,
      "No Staff": s.uploaded.no_staff,
      PTJ: s.uploaded.ptj,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Staff")
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" })
    const file = new File([buf], "staff-import.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const formData = new FormData()
    formData.append("file", file)
    formData.append("sheet", "0")
    formData.append("fundId", String(fundId))

    bulkUploadXlsx.mutate(formData, {
      onSuccess: () => {
        setFile(null)
        setTableData([])
      },
    })
  }

  const onCancel = () => {
    setFile(null)
    setTableData([])
  }

  const conflictedData = useMemo(
    () => tableData.filter((s) => s.conflict),
    [tableData]
  )

  const handleResolve = useCallback(
    (
      staff: StaffUploadComparison,
      resolved: StaffUploadComparison["uploaded"]
    ) => {
      update.mutate(
        { ...resolved, userId: staff.existing!.user_id },
        {
          onSuccess: () => {
            updateStaffData(staff, resolved)
            toast.success("Staff updated")
          },
        }
      )
    },
    [update, updateStaffData]
  )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create New Staff</h2>
          <p className="text-sm text-muted-foreground">
            Import Excel file to register staff in bulk.
          </p>
        </div>

        <label
          htmlFor="staff-excel-upload"
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
              </span>
            </div>
          )}
          <input
            id="staff-excel-upload"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {file && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null)
                setTableData([])
              }}
            >
              Remove file
            </Button>
          </div>
        )}
      </div>

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
                columns={comparisonStaffCol(updateStaffData, deleteStaff)}
                data={tableData}
                colName="name"
                placeholder="Search for Name"
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
                      <AlertDialogTitle>Import New Staff</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to create {tableData.length} new
                        staff records?
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
    </div>
  )
}