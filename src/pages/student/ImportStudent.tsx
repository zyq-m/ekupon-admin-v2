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
import { Button } from "@/components/ui/button"
import {
  useBulkUpsert,
  useCheckStudentUpload,
  useUpdateStudent,
} from "@/hooks/use-student"
import { Upload } from "lucide-react"
import { useCallback, useState } from "react"
import { comparisonCol } from "./columns"

import { StudentSearchDialog } from "@/components/form/student-form"

export function ImportStudent() {
  const [file, setFile] = useState<File | null>(null)
  const [fundId, setFundId] = useState<number | null>(null)
  const [tableData, setTableData] = useState<StudentUploadResponse["students"]>(
    []
  ) // ✅ Table state

  const checkUpload = useCheckStudentUpload()
  const bulkUpsert = useBulkUpsert()
  const update = useUpdateStudent()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (!file.name.endsWith(".xlsx")) {
      alert("Please upload a .xlsx file only.")
      e.target.value = ""
      return
    }

    setFile(file)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("sheet", "0")

    checkUpload.mutate(formData, {
      onSuccess: (res) => {
        setTableData(res.students) // ✅ Initialize table data
      },
    })
  }

  // ✅ Update function for dialog
  const updateStudentData = useCallback(
    (rowIndex: number, updatedData: StudentUploadComparison["uploaded"]) => {
      setTableData((prev) =>
        prev.map((student, index) =>
          index === rowIndex
            ? {
                ...student,
                uploaded: updatedData,
                differences: recalculateDifferences(
                  updatedData,
                  student.existing
                ),
                conflict: false,
              }
            : student
        )
      )
    },
    []
  )

  const deleteStudent = useCallback((rowIndex: number) => {
    setTableData((prev) => prev.filter((_, index) => index !== rowIndex))
  }, [])

  const onUpload = () => {
    bulkUpsert.mutate(
      { students: tableData, fundId: fundId! },
      {
        onSuccess: () => {
          setFile(null)
          setTableData([])
        },
      }
    )
  }

  const onCancel = () => {
    setFile(null)
    setTableData([])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create New Student</h2>
          <p className="text-sm text-muted-foreground">
            Import Excel file to register students in bulk.
          </p>
        </div>

        <label
          htmlFor="excel-upload"
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 hover:bg-gray-50"
        >
          <Upload className="mb-2 h-6 w-6 text-gray-500" />
          <span className="text-sm text-gray-600">
            {file ? `Selected: ${file.name}` : "Click to upload .xlsx file"}
          </span>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Table */}
      {tableData.length > 0 && (
        <div>
          <DataTable
            columns={comparisonCol(updateStudentData, deleteStudent, update)} // ✅ Pass functions
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
                  disabled={fundId || !bulkUpsert.isPending ? false : true}
                >
                  {bulkUpsert.isPending ? "Uploading.." : "Upload"}
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
        </div>
      )}
      <StudentSearchDialog onSearch={() => {}} />
    </div>
  )
}

// Helper function
function recalculateDifferences(
  uploaded: {
    ic_no: string
    matric_no: string
    name: string
  },
  existing:
    | {
        ic_no: string
        matric_no: string
        name: string
        user_id: number
      }
    | undefined
): string[] {
  const differences = []
  if (existing) {
    if (uploaded.ic_no !== existing.ic_no) differences.push("IC No mismatch")
    if (uploaded.matric_no !== existing.matric_no)
      differences.push("Matric No mismatch")
    if (
      uploaded.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()
    ) {
      differences.push("Name mismatch")
    }
  }
  return differences
}
