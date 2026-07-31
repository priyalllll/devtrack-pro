// server/src/utils/jwt.utils.js
// ─────────────────────────────────────────────────────────────────────────────
// JWT utility functions.
//
// Access Token  — short-lived (15m), sent as Authorization: Bearer <token>
// Refresh Token — long-lived (7d), stored in httpOnly cookie + DB
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken'
import env from '../config/env.js'

/**
 * Signs an access token.
 * @param {{ userId: string, role: string }} payload
 * @returns {string}
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  })
}

/**
 * Signs a refresh token.
 * @param {{ userId: string, role: string }} payload
 * @returns {string}
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  })
}

/**
 * Verifies and decodes an access token.
 * @param {string} token
 * @returns {{ userId: string, role: string, iat: number, exp: number }}
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET)
}

/**
 * Verifies and decodes a refresh token.
 * @param {string} token
 * @returns {{ userId: string, role: string, iat: number, exp: number }}
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}

/**
 * Generates both access and refresh tokens.
 * @param {{ userId: string, role: string }} payload
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokenPair(payload) {
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  }
}
