// client/src/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook — wraps auth store + service calls.
// Provides: login, register, logout mutations with toast notifications.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@store/authStore'
import * as authService from '@services/auth.service'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (formData) => {
    setIsPending(true)
    try {
      const { data } = await authService.register(formData)
      setAuth(data.data.user, data.data.accessToken)
      toast.success('Welcome to DevTrack Pro!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (formData) => {
    setIsPending(true)
    try {
      const { data } = await authService.login(formData)
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome back, ${data.data.user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    setIsPending(true)
    try {
      await authService.logout()
    } catch {
      // Ignore errors — always clear local state
    } finally {
      clearAuth()
      setIsPending(false)
      navigate('/login', { replace: true })
      toast.success('You have been logged out.')
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    isPending,
    login,
    register,
    logout,
  }
}
