import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Coffee,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Ticket,
  User2,
  Users,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Student", url: "/student", icon: Users },
  { title: "Cafe", url: "/cafe", icon: Coffee },
  { title: "Coupon", url: "/coupon", icon: Ticket },
  { title: "Transaction", url: "/transaction", icon: CreditCard },
]

export function AppSidebar() {
  const navigation = useNavigate()

  const onLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigation("/login")
  }
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
              // Check if the current route matches the item URL
              const isActive = location.pathname.startsWith(item.url)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive} // Shadcn sidebar supports this prop
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenu>
            <SidebarMenuButton size="lg" onClick={onLogout}>
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
