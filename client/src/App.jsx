// client/src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root component — sets up:
//   - React Router with BrowserRouter
//   - AuthInitializer (silent session restore on boot)
//   - Route guards (ProtectedRoute / GuestRoute)
//   - Toaster for notifications
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AuthInitializer  from '@/router/AuthInitializer'
import ProtectedRoute   from '@/router/ProtectedRoute'
import GuestRoute       from '@/router/GuestRoute'
import LoginPage        from '@pages/auth/LoginPage'
import RegisterPage     from '@pages/auth/RegisterPage'
import DashboardPage    from '@pages/dashboard/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color:      '#f1f5f9',
              border:     '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize:   '0.875rem',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* ── Guest-only routes (redirect to /dashboard if logged in) ── */}
          <Route element={<GuestRoute />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Protected routes (redirect to /login if not logged in) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Phase 3+ routes will be added here */}
          </Route>

          {/* ── Default redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  )
}
