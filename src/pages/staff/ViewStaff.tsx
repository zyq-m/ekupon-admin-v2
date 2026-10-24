import type { StaffProfile } from "@/api/staff"
import DataTable from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useSuspendUser } from "@/hooks/use-auth"
import { useGetStaffProfile, useGetStaffTf } from "@/hooks/use-staff"
import { Hash, History, Mail, ShieldCheck, User, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { staffCouponCol, staffTfCol } from "./columns"

export default function ViewStaffPage() {
  const { email } = useParams<{ email: string }>()
  const { can } = useAuth()
  const canReport = can("can_generate_report")
  const [fundId, setFundId] = useState<number>(0)
  const { data: profile } = useGetStaffProfile(email!)
  const { data: tf } = useGetStaffTf(email!, fundId)

  useEffect(() => {
    if (!fundId && profile?.coupons[0]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFundId(profile.coupons[0].fund_id)
    }
  }, [fundId, profile])

  return (
    <div className="space-y-6">
      {profile && <StaffProfileCard data={profile} />}

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
            columns={staffCouponCol}
            colName="fund_name"
            data={profile?.coupons || []}
            placeholder="Search for Coupon"
          />
        </TabsContent>
        {canReport && (
          <TabsContent value="trans">
            <DataTable
              columns={staffTfCol}
              colName="cafe_name"
              data={tf?.transactions || []}
              placeholder="Search for Recipient"
            >
              <Select
                value={fundId ? fundId.toString() : undefined}
                onValueChange={(value) => setFundId(Number(value))}
              >
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

export const StaffProfileCard = ({ data }: { data: StaffProfile }) => {
  const suspend = useSuspendUser()
  const { isSuperAdmin } = useAuth()
  const isActive = data.user?.is_active

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-lg leading-tight font-bold">{data.name}</p>
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                Staff Profile
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

        <div className="grid grid-cols-1 gap-3">
          <DetailRow
            icon={<Hash size={16} />}
            label="No Staff"
            value={data.no_staff}
          />
          <DetailRow
            icon={<Mail size={16} />}
            label="Email"
            value={data.email}
          />
          <DetailRow
            icon={<ShieldCheck size={16} />}
            label="PTJ"
            value={data.ptj.ptj}
          />
          <DetailRow
            icon={<User size={16} />}
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
