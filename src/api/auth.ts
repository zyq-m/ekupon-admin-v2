import api from "./client"

export type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export type LoginReqBody = {
  id: string
  password: string
}

// ========== suspend user ==========
export type SuspendUserBody = {
  id: number
  active: boolean
}

export type SuspendUserResponse = {
  message: string
  // add any other fields your backend returns if needed
}

export const authAPI = {
  login: (loginBody: LoginReqBody) =>
    api.post<LoginResponse>("/auth/login", loginBody).then((res) => res.data),

  // Suspend (or activate) a user
  suspendUser: (body: SuspendUserBody) =>
    api.put<SuspendUserResponse>("/auth/suspend", body).then((res) => res.data),
}
