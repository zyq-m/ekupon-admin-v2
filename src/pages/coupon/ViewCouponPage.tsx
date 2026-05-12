import DataTable from "@/components/data-table"
import { FundSummaryCards } from "@/components/fund-summary-card"
import { useGetFundById } from "@/hooks/use-fund"
import { formatRM } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useParams } from "react-router-dom"

type CouponRow = NonNullable<ReturnType<typeof useGetFundById>["data"]>["coupons"][number]

const columns: ColumnDef<CouponRow>[] = [
  {
    id: "name",
    accessorFn: (row) => row.student?.name,
    header: "Student Name",
    cell: ({ row }) => <div>{row.original.student?.name ?? "N/A"}</div>,
  },
  {
    id: "ic_no",
    accessorFn: (row) => row.student?.ic_no,
    header: "IC No.",
    cell: ({ row }) => <div>{row.original.student?.ic_no ?? "N/A"}</div>,
  },
  {
    id: "matric_no",
    accessorFn: (row) => row.student?.matric_no,
    header: "Matric No.",
    cell: ({ row }) => <div>{row.original.student?.matric_no ?? "N/A"}</div>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <div>{formatRM(row.original.balance)}</div>,
  },
]

export function ViewCouponPage() {
  const { id } = useParams<{ id: string }>()
  const fundId = id ? Number(id) : undefined
  const { data } = useGetFundById(fundId)

  return (
    <div className="space-y-6">
      {data && <FundSummaryCards {...data} />}
      <DataTable
        columns={columns}
        data={data?.coupons || []}
        colName="name"
        placeholder="Search for Student Name"
      />
    </div>
  )
}
