import DataTable from "@/components/data-table"
import { FundFormTriggerBtn } from "@/components/form/fund-form"
import { useGetFunds } from "@/hooks/use-fund"
import { columns } from "../fund/columns"

export function CouponListPage() {
  const { data } = useGetFunds()

  return (
    <div>
      <DataTable
        columns={columns}
        colName="name"
        data={data || []}
        placeholder="Search for fund name"
      >
        <FundFormTriggerBtn />
      </DataTable>
    </div>
  )
}
