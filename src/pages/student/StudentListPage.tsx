import DataTable from "@/components/data-table"
import { FundSummaryCards } from "@/components/fund-summary-card"
import { SelectFunds } from "@/components/select-funds"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSuspendUser } from "@/hooks/use-auth"
import { useGetFundById } from "@/hooks/use-fund"
import { useGetStudents } from "@/hooks/use-student"
import { Plus } from "lucide-react"
import { useState } from "react"
import { columns } from "./columns"

export function StudentListPage() {
  const [fundId, setId] = useState<number>()
  const { data } = useGetStudents(fundId)
  const { data: summary } = useGetFundById(fundId)
  const suspend = useSuspendUser()

  return (
    <div className="space-y-6">
      {summary && <FundSummaryCards {...summary} />}
      <DataTable
        columns={columns({
          suspend,
        })}
        data={data || []}
        colName="name"
        placeholder="Search for Name"
      >
        <div className="flex gap-2">
          <SelectFunds onValueChange={setId} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new student</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </DataTable>
    </div>
  )
}
