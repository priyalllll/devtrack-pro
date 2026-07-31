// client/src/services/auth.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth API calls — thin wrappers around the axios instance.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

/**
 * @param {{ name: string, email: string, password: string }} data
 */
export const register = (data) => api.post('/auth/register', data)

/**
 * @param {{ email: string, password: string }} data
 */
export const login = (data) => api.post('/auth/login', data)

/**
 * Uses the httpOnly refresh token cookie automatically.
 */
export const refreshToken = () => api.post('/auth/refresh')

/**
 * Signs out the current user and clears the refresh token cookie.
 */
export const logout = () => api.post('/auth/logout')

/**
 * Returns the authenticated user's profile.
 */
export const getMe = () => api.get('/auth/me')
