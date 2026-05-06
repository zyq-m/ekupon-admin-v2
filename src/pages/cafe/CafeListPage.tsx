import DataTable from "@/components/data-table"
import { CafeFormDialog } from "@/components/form/cafe-form"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSuspendUser } from "@/hooks/use-auth"
import { useGetCafe, useUpdateCafe } from "@/hooks/use-cafe"
import { Plus } from "lucide-react"
import { useState } from "react"
import { columns } from "./columns"

export function CafeListPage() {
  const { data } = useGetCafe()
  const suspend = useSuspendUser()
  const update = useUpdateCafe()

  const [open, setOpen] = useState(false)

  return (
    <div>
      <DataTable
        columns={columns({ suspend, update })}
        data={data ?? []}
        colName="cafe_name"
        placeholder="Search for Cafe Name"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add new cafe</p>
          </TooltipContent>
        </Tooltip>

        <CafeFormDialog
          onSubmit={() => {}}
          title="Create new cafe"
          desc="Fill all the required fieldState"
          isOpen={open}
          setOpen={setOpen}
        />
      </DataTable>
    </div>
  )
}
