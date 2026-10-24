import type { StudentTfParams } from "@/api/transaction"
import type { Student } from "@/api/student"
import DataTable from "@/components/data-table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth, useSuspendUser } from "@/hooks/use-auth"
import { useGetStudentById } from "@/hooks/use-student"
import { useGetStudentTf } from "@/hooks/use-transaction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Hash,
  History,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { studentCouponCol, studentTfCol } from "./columns"

export default function ViewTfStudentPage() {
  const { icNo } = useParams<StudentTfParams>()
  const [id, setFundId] = useState("")
  const { can } = useAuth()
  const canReport = can("can_generate_report")
  const { data: profile } = useGetStudentById(icNo!)
  const { data: tf } = useGetStudentTf({ icNo: icNo!, fundId: id! })

  useEffect(() => {
    if (!id && profile?.coupons[0]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFundId(profile.coupons[0].fund_id.toString())
    }
  }, [id, profile])

  return (
    <div className="space-y-6">
      {/* Profile */}
      {profile && <StudentProfile data={profile} />}

      <Tabs defaultValue="coupon">
        <TabsList variant="line">
          <TabsTrigger value="coupon">
            <Wallet />
            Coupon
          </TabsTrigger>
          {canReport && (
            <TabsTrigger value="trans">
              <History />
              History
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="coupon">
          <DataTable
            columns={studentCouponCol}
            colName="fund_name"
            data={profile?.coupons || []}
            placeholder="Search for Coupon"
          />
        </TabsContent>
        {canReport && (
          <TabsContent value="trans">
            <DataTable
              colName="cafe_name"
              columns={studentTfCol}
              data={tf?.transactions || []}
              placeholder="Search for Recipient"
            >
              <Select value={id} onValueChange={(e) => setFundId(e)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Fund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {profile?.coupons.map((coupon) => (
                      <SelectItem
                        key={coupon.id}
                        value={coupon.fund_id.toString()}
                      >
                        {coupon.fund.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </DataTable>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export const StudentProfile = ({ data }: { data: Student }) => {
  const suspend = useSuspendUser()
  const { isSuperAdmin } = useAuth()
  const isActive = data.user?.is_active

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {/* Name Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-lg leading-tight font-bold">{data.name}</p>
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                Student Profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Active" : "Suspended"}
            </Badge>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  suspend.mutate({
                    id: data.user_id,
                    active: !isActive,
                  })
                }
              >
                {isActive ? "Suspend" : "Activate"}
              </Button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3">
          <DetailRow
            icon={<Hash size={16} />}
            label="Matric No"
            value={data.matric_no}
          />
          <DetailRow
            icon={<CreditCard size={16} />}
            label="IC Number"
            value={data.ic_no}
          />
          <DetailRow
            icon={<ShieldCheck size={16} />}
            label="User ID"
            value={data.user_id}
          />
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
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-muted-foreground">{icon}</div>
      <span className="min-w-20 text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
