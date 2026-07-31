// client/src/pages/auth/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Login page with:
//   - React Hook Form + Zod validation
//   - Password visibility toggle
//   - Animated form with premium dark design
//   - "Remember me" checkbox
//   - Link to Register page
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@hooks/useAuth'

// ── Zod validation schema (client-side) ──────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
  rememberMe: z.boolean().optional(),
})

// ── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeSlashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

function LogoIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isPending } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = (data) => login(data)

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-surface-900 to-surface-950" />
        {/* Decorative orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-primary-700/15 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              DevTrack <span className="text-primary-400">Pro</span>
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your projects,<br />
            <span className="text-primary-400">perfectly tracked.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Manage tasks, collaborate with your team, and ship projects on time — all in one place.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '⚡', text: 'Real-time Kanban boards' },
            { icon: '📊', text: 'Analytics & progress tracking' },
            { icon: '🔒', text: 'Enterprise-grade security' },
          ].map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="text-lg">{feature.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              DevTrack <span className="text-primary-400">Pro</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="mt-2 text-slate-400">Sign in to continue to your workspace.</p>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="label text-slate-300">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 ${
                  errors.email ? 'input-error' : ''
                }`}
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="label text-slate-300 mb-0">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 pr-11 ${
                    errors.password ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  id="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeSlashIcon className="w-5 h-5" />
                    : <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="login-remember-me"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-950 cursor-pointer"
              />
              <label
                htmlFor="login-remember-me"
                className="text-sm text-slate-400 cursor-pointer select-none"
              >
                Remember me for 7 days
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isPending}
              className="btn-primary btn-lg w-full mt-2 text-base font-semibold shadow-glow disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-950 px-4 text-sm text-slate-500">Don't have an account?</span>
            </div>
          </div>

          {/* Register link */}
          <Link
            id="login-register-link"
            to="/register"
            className="btn btn-secondary border border-surface-700 w-full text-slate-300 hover:text-white hover:border-surface-600"
          >
            Create a free account
          </Link>

          <p className="mt-8 text-center text-xs text-slate-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-slate-500 hover:text-slate-400 underline-offset-2 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-slate-500 hover:text-slate-400 underline-offset-2 underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
