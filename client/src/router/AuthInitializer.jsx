// client/src/router/AuthInitializer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Runs once on app boot to silently restore the user's session.
//
// Strategy:
//   1. Try POST /auth/refresh — the httpOnly cookie is sent automatically.
//   2. If successful: get /auth/me and populate the auth store.
//   3. If it fails (no session / expired): clear the store, show login.
//   4. Either way: set isLoading=false so the app renders.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useAuthStore } from '@store/authStore'
import * as authService from '@services/auth.service'

export default function AuthInitializer({ children }) {
  const { setAuth, setLoadingDone } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      try {
        // Attempt silent token refresh using the httpOnly cookie
        const { data: refreshData } = await authService.refreshToken()
        const newAccessToken = refreshData.data.accessToken

        // Update the store's access token so subsequent requests use it
        useAuthStore.getState().setAccessToken(newAccessToken)

        // Fetch the user profile
        const { data: meData } = await authService.getMe()

        if (!cancelled) {
          setAuth(meData.data.user, newAccessToken)
        }
      } catch {
        // No valid session — show login page
        if (!cancelled) {
          setLoadingDone()
        }
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [setAuth, setLoadingDone])

  return children
}
