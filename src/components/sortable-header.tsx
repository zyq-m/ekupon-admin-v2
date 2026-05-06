import { Button } from "@/components/ui/button"
import type { Column } from "@tanstack/react-table"
import { ChevronsUpDown } from "lucide-react"

export type SortableHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
}

export function SortableHeader<TData, TValue>({
  column,
  title,
}: SortableHeaderProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ChevronsUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}
