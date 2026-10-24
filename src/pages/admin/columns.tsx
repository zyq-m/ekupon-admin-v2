import type { AdminAccount } from "@/api/admin"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { AdminRowActions } from "./admin-row-actions"

export const adminColumns: ColumnDef<AdminAccount>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "role",
    accessorFn: (row) => (row.is_super_admin ? "SUPER_ADMIN" : "ADMIN"),
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.is_super_admin ? "default" : "secondary"}>
        {row.original.is_super_admin ? "Super admin" : "Admin"}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => row.is_active,
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.original.is_active
            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
        )}
      >
        {row.original.is_active ? "Active" : "Invited"}
      </Badge>
    ),
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.original.permissions
      const count = Object.values(permissions).filter(Boolean).length
      return (
        <span className="text-sm text-muted-foreground">
          {row.original.is_super_admin ? "All" : `${count} / 5`}
        </span>
      )
    },
  },
  {
    id: "funds",
    header: "Funds",
    cell: ({ row }) => {
      const funds = row.original.funds
      if (row.original.is_super_admin) return "All funds"
      if (!funds.length) {
        return <span className="text-muted-foreground">No funds</span>
      }
      return (
        <span className="line-clamp-1 max-w-56">
          {funds.map((fund) => fund.name).join(", ")}
        </span>
      )
    },
  },
  {
    id: "joined",
    accessorKey: "joined",
    header: "Joined",
    cell: ({ row }) => formatDate(row.original.joined),
  },
  {
    id: "actions",
    cell: ({ row }) => <AdminRowActions admin={row.original} />,
  },
]
