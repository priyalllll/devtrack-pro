// client/src/pages/dashboard/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Placeholder dashboard — replaced in Phase 3.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth } from '@hooks/useAuth'

export default function DashboardPage() {
  const { user, logout, isPending } = useAuth()

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <div className="text-center animate-fade-in max-w-md">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
          <span className="text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Welcome, {user?.name}! 🎉
        </h1>
        <p className="text-slate-400 mb-2">You are successfully authenticated.</p>
        <p className="text-slate-500 text-sm mb-8">{user?.email}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
          <span className="badge bg-green-900/50 text-green-400 border border-green-700/50">
            ✓ Auth Phase Complete
          </span>
          <span className="badge bg-blue-900/50 text-blue-400 border border-blue-700/50">
            → Phase 3 Next
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-800 border border-surface-700 text-left mb-6">
          <p className="text-xs text-slate-500 font-mono mb-1">User object:</p>
          <pre className="text-xs text-slate-300 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <button
          id="dashboard-logout-btn"
          onClick={logout}
          disabled={isPending}
          className="btn-danger"
        >
          {isPending ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </div>
  )
}
