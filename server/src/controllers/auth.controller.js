// server/src/controllers/auth.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth route handlers. Thin layer: validate → call service → send response.
//
// Cookie strategy:
//   - Refresh token is set as an httpOnly, sameSite=strict cookie (not exposed to JS)
//   - Access token is returned in the response body (stored by client in memory/localStorage)
// ─────────────────────────────────────────────────────────────────────────────

import * as authService           from '../services/auth.service.js'
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validators.js'
import { HTTP }                   from '../config/constants.js'
import env                        from '../config/env.js'

// ── Cookie options ────────────────────────────────────────────────────────────
const REFRESH_COOKIE_NAME = 'refreshToken'

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: env.isProduction ? 'strict' : 'lax',
  secure:   env.isProduction,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/',
}

// ── POST /auth/register ───────────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body)
    const result = await authService.registerUser(body)

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions)

    return res.status(HTTP.CREATED).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user:        result.user,
        accessToken: result.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const body   = loginSchema.parse(req.body)
    const result = await authService.loginUser(body)

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions)

    return res.status(HTTP.OK).json({
      success: true,
      message: 'Login successful.',
      data: {
        user:        result.user,
        accessToken: result.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /auth/refresh ────────────────────────────────────────────────────────
// Accepts refresh token from: httpOnly cookie OR request body (fallback for mobile clients)
export async function refresh(req, res, next) {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME]
    const tokenFromBody   = req.body?.refreshToken

    const incomingToken = tokenFromCookie || tokenFromBody

    if (!incomingToken) {
      // Validate body only if cookie is absent — this gives a clean error
      refreshSchema.parse(req.body)
    }

    const tokens = await authService.refreshTokens(incomingToken)

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions)

    return res.status(HTTP.OK).json({
      success: true,
      message: 'Token refreshed.',
      data: {
        accessToken: tokens.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /auth/logout ─────────────────────────────────────────────────────────
export async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.user.userId)

    // Clear the cookie
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' })

    return res.status(HTTP.OK).json({
      success: true,
      message: 'Logged out successfully.',
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.userId)

    return res.status(HTTP.OK).json({
      success: true,
      data: { user },
    })
  } catch (err) {
    next(err)
  }
}
