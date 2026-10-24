import DataTable from "@/components/data-table"
import { InviteAdminDialog } from "@/components/form/admin-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGetAdmins } from "@/hooks/use-admin"
import { Plus } from "lucide-react"
import { useState } from "react"
import { adminColumns } from "./columns"

export function AdminListPage() {
  const { data, isLoading } = useGetAdmins()
  const [inviteOpen, setInviteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <DataTable
        columns={adminColumns}
        data={data ?? []}
        colName="name"
        placeholder="Search for admin name"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setInviteOpen(true)}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite admin</p>
          </TooltipContent>
        </Tooltip>
      </DataTable>

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
