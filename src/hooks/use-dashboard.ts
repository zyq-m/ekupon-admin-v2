import { dashboardAPI } from "@/api/dashboard"
import { useQuery } from "@tanstack/react-query"

export function useGetData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardAPI.getDashboard,
  })
}

export function useGetTotalTrans(month: string) {
  return useQuery({
    queryKey: ["dashboard", "transaction", month],
    queryFn: () => dashboardAPI.getTotalTrans(month),
  })
}
