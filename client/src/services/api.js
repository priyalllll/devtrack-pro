// client/src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Axios instance with:
//   - Base URL pointing to the Express backend
//   - Authorization header injected from auth store
//   - Automatic token refresh on 401 (single-flight retry)
//   - Request/response interceptors for consistent error handling
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'
import { useAuthStore } from '@store/authStore'

const api = axios.create({
  baseURL:         '/api/v1',
  withCredentials: true, // Send httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request interceptor — inject access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 with silent token refresh ────────────
let isRefreshing     = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb)
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh for 401 errors that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true },
        )
        const newAccessToken = data.data.accessToken
        useAuthStore.getState().setAccessToken(newAccessToken)
        onRefreshed(newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed — log the user out
        useAuthStore.getState().clearAuth()
        refreshSubscribers = []
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
