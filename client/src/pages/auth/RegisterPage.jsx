// client/src/pages/auth/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Register page with:
//   - React Hook Form + Zod validation
//   - Password strength indicator
//   - Confirm password matching
//   - Password visibility toggles
//   - Animated design matching the Login page aesthetic
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@hooks/useAuth'

// ── Zod schema ────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required.')
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name must be at most 80 characters.')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must be at most 72 characters.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and a number.',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue.' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

// ── Password strength calculator ─────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password))    score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak',   color: 'bg-red-500'    }
  if (score <= 4) return { score, label: 'Fair',   color: 'bg-amber-500'  }
  if (score <= 5) return { score, label: 'Good',   color: 'bg-blue-500'   }
  return             { score, label: 'Strong', color: 'bg-green-500'  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirm]  = useState(false)
  const { register: registerUser, isPending }  = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const passwordValue = watch('password', '')
  const strength = getPasswordStrength(passwordValue)

  const onSubmit = (data) => {
    const { confirmPassword, terms, ...payload } = data
    registerUser(payload)
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-surface-900 to-surface-950" />
        <div className="absolute -top-10 left-10 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-primary-700/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              DevTrack <span className="text-primary-400">Pro</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Start tracking smarter<br />
            <span className="text-primary-400">today — for free.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-xs">
            Join thousands of teams shipping faster with DevTrack Pro.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { value: '10,000+', label: 'Teams worldwide' },
            { value: '99.9%',   label: 'Uptime guaranteed' },
            { value: 'Free',    label: 'No credit card required' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary-400">{stat.value}</span>
              <span className="text-slate-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              DevTrack <span className="text-primary-400">Pro</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="mt-2 text-slate-400">Get started for free — no credit card required.</p>
          </div>

          <form id="register-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="label text-slate-300">Full name</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                {...register('name')}
                className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 ${
                  errors.name ? 'input-error' : ''
                }`}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="label text-slate-300">Work email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                {...register('email')}
                className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 ${
                  errors.email ? 'input-error' : ''
                }`}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="label text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 pr-11 ${
                    errors.password ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  id="register-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}

              {/* Password strength bar */}
              {passwordValue && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= segment * 1.5
                            ? strength.color
                            : 'bg-surface-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === 'Weak'   ? 'text-red-400'   :
                    strength.label === 'Fair'   ? 'text-amber-400' :
                    strength.label === 'Good'   ? 'text-blue-400'  :
                    'text-green-400'
                  }`}>
                    Password strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="label text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className={`input bg-surface-800 border-surface-700 text-white placeholder-slate-500 focus:border-primary-500 pr-11 ${
                    errors.confirmPassword ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  id="register-toggle-confirm-password"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="register-terms"
                type="checkbox"
                {...register('terms')}
                className="w-4 h-4 mt-0.5 rounded border-surface-700 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-950 cursor-pointer flex-shrink-0"
              />
              <label
                htmlFor="register-terms"
                className="text-sm text-slate-400 cursor-pointer select-none leading-relaxed"
              >
                I agree to the{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="error-text -mt-3">{errors.terms.message}</p>}

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isPending}
              className="btn-primary btn-lg w-full mt-1 text-base font-semibold shadow-glow disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create free account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-950 px-4 text-sm text-slate-500">Already have an account?</span>
            </div>
          </div>

          <Link
            id="register-login-link"
            to="/login"
            className="btn btn-secondary border border-surface-700 w-full text-slate-300 hover:text-white hover:border-surface-600"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}
