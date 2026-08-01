// client/src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// DevTrack Pro Root Application Component
// Integrated with ErrorBoundary, Toast Notifications, Protected Routes,
// 404 & 403 Error pages.
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AuthInitializer  from '@/router/AuthInitializer'
import ProtectedRoute   from '@/router/ProtectedRoute'
import GuestRoute       from '@/router/GuestRoute'
import ErrorBoundary    from '@components/common/ErrorBoundary'
import AppLayout        from '@components/layout/AppLayout'

import LoginPage        from '@pages/auth/LoginPage'
import RegisterPage     from '@pages/auth/RegisterPage'
import DashboardPage    from '@pages/dashboard/DashboardPage'
import ProjectsPage     from '@pages/projects/ProjectsPage'
import TasksPage        from '@pages/tasks/TasksPage'
import KanbanPage       from '@pages/kanban/KanbanPage'
import AnalyticsPage    from '@pages/analytics/AnalyticsPage'
import NotFoundPage     from '@pages/error/NotFoundPage'
import ForbiddenPage    from '@pages/error/ForbiddenPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthInitializer>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background:   '#1e293b',
                color:        '#f1f5f9',
                border:       '1px solid #334155',
                borderRadius: '0.75rem',
                fontSize:     '0.875rem',
              },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* ── Guest-only routes ── */}
            <Route element={<GuestRoute />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ── Protected SaaS routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects"  element={<ProjectsPage />} />
                <Route path="/tasks"     element={<TasksPage />} />
                <Route path="/kanban"    element={<KanbanPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile"   element={<Navigate to="/dashboard" replace />} />
                <Route path="/settings"  element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* ── Error pages ── */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFoundPage />} />

            {/* ── Default & catch-all routes ── */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFoundPage />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
