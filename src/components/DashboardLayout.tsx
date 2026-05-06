import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { ModeToggle } from "./mode-toggle"

// Map paths to titles
const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/student": "Student Management",
  "/cafe": "Cafe Menu",
  "/transaction": "Transaction Records",
  "/coupon": "Coupon Management",
}

export function DashboardLayout() {
  const location = useLocation()
  // Get the title or default to 'Dashboard'
  const currentTitle = titleMap[location.pathname] || "Dashboard"
  const isAuthenticated = !!localStorage.getItem("accessToken")

  return isAuthenticated ? (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="font-semibold">{currentTitle}</h1>
          </div>

          <ModeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
            <Toaster />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ) : (
    <Navigate to="/ekupon-admin/login" replace />
  )
}
