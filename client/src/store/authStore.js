// client/src/store/authStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Zustand auth store.
//
// State:
//   - user         — current user object (or null)
//   - accessToken  — JWT access token (stored in memory, NOT localStorage)
//   - isLoading    — true while checking persisted session on mount
//   - isAuthenticated — derived from user != null
//
// Note: The refresh token lives in an httpOnly cookie and is not accessible here.
//       The access token is kept in memory to reduce XSS risk.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // ── State ───────────────────────────────────────────────────────────────────
  user:            null,
  accessToken:     null,
  isLoading:       true,   // true until initial session check completes
  isAuthenticated: false,

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Call after a successful login or register */
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading:       false,
    }),

  /** Call after a successful token refresh */
  setAccessToken: (accessToken) =>
    set({ accessToken }),

  /** Call after logout or when refresh fails */
  clearAuth: () =>
    set({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,
      isLoading:       false,
    }),

  /** Mark initial load complete (used when no session is found) */
  setLoadingDone: () =>
    set({ isLoading: false }),
}))
