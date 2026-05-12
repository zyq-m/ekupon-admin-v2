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
import type { LucideIcon } from "lucide-react"
import {
  ChevronRight,
  Coffee,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Ticket,
  User2,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

type MenuItem = {
  title: string
  icon: LucideIcon
  url?: string
  children: { title: string; url: string }[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/ekupon-admin/dashboard",
    children: [],
  },
  {
    title: "Student",
    icon: GraduationCap,
    children: [
      { title: "Search Student", url: "/ekupon-admin/student" },
      { title: "Import Student", url: "/ekupon-admin/student/import" },
    ],
  },
  { title: "Cafe", icon: Coffee, url: "/ekupon-admin/cafe", children: [] },
  { title: "Coupon", icon: Ticket, url: "/ekupon-admin/coupon", children: [] },
  {
    title: "Transaction",
    icon: CreditCard,
    url: "/ekupon-admin/transaction",
    children: [],
  },
]

export function AppSidebar() {
  const navigation = useNavigate()
  const currentPath = window.location.pathname

  const onLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigation("/ekupon-admin/login")
  }

  const basePath = "/ekupon-admin"

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
            {menuItems.map((item) => {
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
          <SidebarMenu>
            <SidebarMenuButton onClick={onLogout}>
              <LogOut /> Log out
            </SidebarMenuButton>
          </SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <User2 /> ekupon@unisza.edu.my
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
