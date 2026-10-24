import { authAPI } from "@/api/auth"
import { AuthContext, type AuthContextValue } from "@/context/auth-context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (res) => {
      localStorage.setItem("accessToken", res.accessToken)
      localStorage.setItem("refreshToken", res.refreshToken)
      queryClient.clear()
      navigate("/ekupon-admin/dashboard")
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    queryClient.clear()
    navigate("/ekupon-admin/login")
  }
}

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.suspendUser,
    onSuccess: (data) => {
      // optional: invalidate/refresh user lists or detail views
      queryClient.invalidateQueries({ queryKey: ["student"] })
      queryClient.invalidateQueries({ queryKey: ["cafe"] })
      queryClient.invalidateQueries({ queryKey: ["staff"] })

      toast(data.message)
    },
  })
}
