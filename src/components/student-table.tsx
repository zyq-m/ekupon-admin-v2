import { AddStudentDialog } from "@/components/AddStudentDialog"
import { Input } from "@/components/ui/input"
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useState } from "react"

// src/components/student-table.tsx
export function StudentTable({ data, columns }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Required for search
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
  })

  return (
    <div>
      <div className="flex gap-2 py-4">
        <Input
          placeholder="Search by name, matric, or IC..."
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <AddStudentDialog />
      </div>
      {/* Render Table here using Shadcn Table component */}
    </div>
  )
}
