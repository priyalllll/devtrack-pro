// client/src/router/GuestRoute.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from login/register pages.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  // While loading, let the page render (avoids flash-redirect)
  if (isLoading) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
