import type { FundInput } from "@/api/fund"
import DataTable from "@/components/data-table"
import FundFormDialog from "@/components/form/fund-form"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCreateFund, useGetFunds } from "@/hooks/use-fund"
import { Plus } from "lucide-react"
import { useState } from "react"
import { columns } from "../fund/columns"

export function CouponListPage() {
  const { data } = useGetFunds()
  const [open, setOpen] = useState(false)

  const create = useCreateFund()

  const onFormSubmit = (input: FundInput) => {
    create.mutate(input, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <div>
      <DataTable
        columns={columns}
        colName="name"
        data={data || []}
        placeholder="Search for fund name"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create new fund</p>
          </TooltipContent>
        </Tooltip>

        <FundFormDialog
          title="Create new fund"
          desc="Fill all the form"
          isOpen={open}
          setOpen={setOpen}
          onSubmit={onFormSubmit}
        />
      </DataTable>
    </div>
  )
}
