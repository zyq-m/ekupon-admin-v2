import type { PermissionKey } from "@/api/auth"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuth, useLogout } from "@/hooks/use-auth"
import type { LucideIcon } from "lucide-react"
import {
  ChevronRight,
  Coffee,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Ticket,
  User2,
  UserCog,
} from "lucide-react"
import { Link } from "react-router-dom"

type MenuItem = {
  title: string
  icon: LucideIcon
  url?: string
  permission?: PermissionKey
  superOnly?: boolean
  children: { title: string; url: string }[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/ekupon-admin/dashboard",
    permission: "can_generate_report",
    children: [],
  },
  {
    title: "Student",
    icon: GraduationCap,
    permission: "can_manage_user",
    children: [
      { title: "Search Student", url: "/ekupon-admin/student" },
      { title: "Import Student", url: "/ekupon-admin/student/import" },
    ],
  },
  {
    title: "Staff",
    icon: UserCog,
    permission: "can_manage_staff",
    children: [
      { title: "Search Staff", url: "/ekupon-admin/staff" },
      { title: "Import Staff", url: "/ekupon-admin/staff/import" },
    ],
  },
  { title: "Cafe", icon: Coffee, url: "/ekupon-admin/cafe", children: [] },
  { title: "Coupon", icon: Ticket, url: "/ekupon-admin/coupon", children: [] },
  {
    title: "Transaction",
    icon: CreditCard,
    url: "/ekupon-admin/transaction",
    permission: "can_generate_report",
    children: [],
  },
  {
    title: "Admins",
    icon: ShieldCheck,
    url: "/ekupon-admin/admins",
    superOnly: true,
    children: [],
  },
]

export function AppSidebar() {
  const { can, isSuperAdmin, admin, profile } = useAuth()
  const onLogout = useLogout()
  const currentPath = window.location.pathname
  const basePath = "/ekupon-admin"

  const visibleItems = menuItems.filter((item) => {
    if (item.superOnly) return isSuperAdmin
    if (item.permission) return can(item.permission)
    return true
  })

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2 text-lg font-bold">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Ticket size={20} />
          </div>
          <span>eKupon@UniSZA</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {visibleItems.map((item) => {
              if (item.children.length === 0) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={currentPath.startsWith(item.url!)}
                    >
                      <Link to={item.url!}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              const parentUrl = `${basePath}/${item.title.toLowerCase()}`

              return (
                <SidebarMenuItem key={item.title}>
                  <Collapsible
                    defaultOpen={currentPath.startsWith(parentUrl)}
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        isActive={currentPath.startsWith(parentUrl)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.url}>
                            <SidebarMenuSubButton asChild>
                              <Link to={child.url}>{child.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default">
              <User2 />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {admin?.name ?? profile?.role.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {admin?.email}
                </span>
              </div>
              {admin && (
                <Badge
                  variant={isSuperAdmin ? "default" : "secondary"}
                  className="ml-auto"
                >
                  {isSuperAdmin ? "Super" : "Admin"}
                </Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout}>
              <LogOut /> Log out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
