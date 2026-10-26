import { AppSidebar } from "@/components/app-sidebar"
import { PageLoader } from "@/components/auth-guard"
import { AuthProvider } from "@/components/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth, useLogout } from "@/hooks/use-auth"
import { useBuildChecker } from "@/hooks/use-build-checker"
import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { toast } from "sonner"

// Map paths to titles
const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/student": "Student Management",
  "/student/import": "Import Students",
  "/staff": "Staff Management",
  "/staff/import": "Import Staff",
  "/cafe": "Cafe Menu",
  "/transaction": "Transaction Records",
  "/coupon": "Coupon Management",
  "/admins": "Admin Management",
}

export function DashboardLayout() {
  const isAuthenticated = !!localStorage.getItem("accessToken")

  if (!isAuthenticated) {
    return <Navigate to="/ekupon-admin/login" replace />
  }

  return (
    <AuthProvider>
      <AuthenticatedLayout />
    </AuthProvider>
  )
}

function AuthenticatedLayout() {
  useBuildChecker()
  const { isLoading, admin } = useAuth()

  useEffect(() => {
    const onNewBuild = () => {
      toast("New version available", {
        description: "A new build has been deployed.",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
        duration: Infinity,
      })
    }
    window.addEventListener("new-build", onNewBuild)
    return () => window.removeEventListener("new-build", onNewBuild)
  }, [])

  const location = useLocation()
  const currentTitle = titleMap[location.pathname] || "Dashboard"

  if (isLoading) return <PageLoader />

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-lg font-semibold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This account is not an eKupon administrator.
          </p>
          <LogoutButton />
        </div>
      </div>
    )
  }

  return (
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
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function LogoutButton() {
  const logout = useLogout()
  return (
    <button
      onClick={logout}
      className="text-sm font-medium text-primary underline underline-offset-4"
    >
      Back to login
    </button>
  )
}
