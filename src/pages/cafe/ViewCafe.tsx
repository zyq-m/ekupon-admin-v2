import type { TCafeProfile } from "@/api/cafe"
import type { TfParams } from "@/api/transaction"
import { ComboboxSelect } from "@/components/combobox-select"
import DataTable from "@/components/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { TableTooltipsBtn } from "@/components/table-tooltip-btn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetCafeById } from "@/hooks/use-cafe"
import { useGetCafeByIdTf } from "@/hooks/use-transaction"
import { formatRM } from "@/lib/utils"
import dayjs from "dayjs"
import {
  Building2,
  CalendarDays,
  History,
  Landmark,
  Phone,
  Search,
  User,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { cafeTfCol } from "./columns"

export default function ViewCafe() {
  const { id } = useParams<{ id: string }>()
  const { data } = useGetCafeById(id!)

  const [tfPayload, setPayload] = useState<TfParams>({
    fundId: 0,
    from: "",
    to: "",
  })
  const { data: tf } = useGetCafeByIdTf(tfPayload, id!)
  const onFilter = (newFilter: Partial<TfParams>) => {
    setPayload((prev) => ({ ...prev, ...newFilter }))
  }

  return (
    <div className="space-y-6">
      {data && <CafeProfile data={data} />}
      <Tabs defaultValue="trans">
        <TabsList variant="line">
          <TabsTrigger value="trans">
            <History />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trans">
          <DataTable
            columns={cafeTfCol}
            colName="student_name"
            data={tf?.transactions || []}
            placeholder="Search for Sender"
          >
            <div className="flex space-x-2">
              <ComboboxSelect
                items={data?.funds}
                onSelect={(e) => onFilter({ fundId: e })}
              />
              <DateRangeFilter onUpdate={(e) => onFilter(e)} />
              <TableTooltipsBtn tips="Find transaction">
                <Button onClick={() => {}}>
                  <Search />
                </Button>
              </TableTooltipsBtn>
            </div>
          </DataTable>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const CafeProfile = ({ data }: { data: TCafeProfile }) => {
  return (
    <Card className="mx-auto">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Building2 className="text-primary" />
          {data.cafe_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Owner Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={18} />
          </div>
          <div>
            <p className="font-semibold">{data.owner_name}</p>
            <p className="text-xs tracking-wider text-muted-foreground uppercase">
              Owner
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <DetailRow
            icon={<Landmark size={16} />}
            label="Bank"
            value={data.bank}
          />
          <DetailRow
            icon={<Wallet size={16} />}
            label="Account No"
            value={data.account_no}
          />
          <DetailRow
            icon={<Phone size={16} />}
            label="Phone"
            value={data.no_tel ?? "-"}
          />
          <DetailRow
            icon={<Building2 size={16} />}
            label="Premise"
            value={data.premise ?? "-"}
          />
          <DetailRow
            icon={<CalendarDays size={16} />}
            label="Valid From"
            value={dayjs(data.start).format("DD MMM YYYY")}
          />
          <DetailRow
            icon={<CalendarDays size={16} />}
            label="Valid Until"
            value={dayjs(data.end).format("DD MMM YYYY")}
          />
        </div>

        {/* Total earnings card */}
        <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Earnings</p>
          <p className="text-2xl font-bold text-primary">
            {formatRM(data.total_earn)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <span className="min-w-[80px] text-muted-foreground">{label}:</span>
      <span className="truncate font-medium">{value ?? "-"}</span>
    </div>
  )
}
