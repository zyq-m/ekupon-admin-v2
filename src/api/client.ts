import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor: Get token from localStorage
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

// Response interceptor to handle token refresh
const responseInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean
  }

  if (error.response?.status === 403 && !originalRequest._retry) {
    originalRequest._retry = true

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      return Promise.reject(error)
    }

    try {
      // Refresh token call (use global axios or a separate instance to avoid interceptor loops)
      const res = await axios.post<{ accessToken: string }>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken }
      )

      const newAccessToken = res.data.accessToken
      localStorage.setItem("accessToken", newAccessToken)

      // Update header and retry request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      // Clear tokens and handle logout
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login" // Redirect to login
      return Promise.reject(refreshError)
    }
  }

  return Promise.reject(error)
}

// Add interceptors
api.interceptors.request.use(requestInterceptor)
api.interceptors.response.use((response) => response, responseInterceptor)

export default api
