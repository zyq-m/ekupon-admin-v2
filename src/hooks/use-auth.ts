import { authAPI } from "@/api/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useLogin() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (res) => {
      localStorage.setItem("accessToken", res.accessToken)
      localStorage.setItem("refreshToken", res.refreshToken)
      navigate("/dashboard")
    },
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.suspendUser,
    onSuccess: (data) => {
      // optional: invalidate/refresh user lists or detail views
      queryClient.invalidateQueries({ queryKey: ["student"] })
      queryClient.invalidateQueries({ queryKey: ["cafe"] })

      toast(data.message)
    },
  })
}
