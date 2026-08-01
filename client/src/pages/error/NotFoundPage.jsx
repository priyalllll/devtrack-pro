// client/src/pages/error/NotFoundPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// 404 Page Not Found
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full rounded-2xl bg-surface-900 border border-surface-800 p-8 text-center shadow-2xl space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mx-auto">
          <span className="text-3xl font-extrabold font-mono">404</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The page you are looking for doesn't exist, was moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="btn-primary text-xs w-full py-2.5 inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
