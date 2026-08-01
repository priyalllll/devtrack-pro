// server/src/services/auth.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication business logic.
//
// Responsibilities:
//   - Register a new user (hash password, create User record)
//   - Login (verify credentials, generate token pair)
//   - Refresh access token (validate refresh token, rotate it)
//   - Logout (clear refresh token from DB)
//   - Get current user profile
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.utils.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { BCRYPT_ROUNDS, HTTP } from '../config/constants.js'

// ── Register ──────────────────────────────────────────────────────────────────
/**
 * Creates a new user account.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function registerUser({ name, email, password }) {
  // Check for duplicate email (Prisma will also throw P2002, but we give a cleaner message)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('An account with this email already exists.', HTTP.CONFLICT, 'EMAIL_IN_USE')
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  // Create user + generate tokens in a transaction so we can store the refresh token atomically
  const { user, tokens } = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    })

    const tokens = generateTokenPair({ userId: newUser.id, role: newUser.role })

    // Persist hashed refresh token
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 8)
    await tx.user.update({
      where: { id: newUser.id },
      data: { refreshToken: hashedRefresh },
    })

    return { user: newUser, tokens }
  })

  return { user, ...tokens }
}

// ── Login ─────────────────────────────────────────────────────────────────────
/**
 * Authenticates a user with email + password.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Use a generic message to avoid email enumeration
  const invalidCredentials = new AppError(
    'Invalid email or password.',
    HTTP.UNAUTHORIZED,
    'INVALID_CREDENTIALS',
  )

  if (!user) throw invalidCredentials

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) throw invalidCredentials

  const tokens = generateTokenPair({ userId: user.id, role: user.role })

  // Rotate refresh token
  const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 8)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  })

  // Return safe user object (no password hash)
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  }

  return { user: safeUser, ...tokens }
}

// ── Refresh Token ─────────────────────────────────────────────────────────────
/**
 * Issues a new access + refresh token pair from a valid refresh token.
 * Implements token rotation: old refresh token is invalidated on use.
 * @param {string} incomingRefreshToken
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export async function refreshTokens(incomingRefreshToken) {
  const unauthorized = new AppError(
    'Invalid or expired refresh token.',
    HTTP.UNAUTHORIZED,
    'INVALID_REFRESH_TOKEN',
  )

  let payload
  try {
    payload = verifyRefreshToken(incomingRefreshToken)
  } catch {
    throw unauthorized
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.refreshToken) throw unauthorized

  const tokenMatch = await bcrypt.compare(incomingRefreshToken, user.refreshToken)
  if (!tokenMatch) throw unauthorized

  // Issue new token pair (rotation)
  const tokens = generateTokenPair({ userId: user.id, role: user.role })
  const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 8)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  })

  return tokens
}

// ── Logout ────────────────────────────────────────────────────────────────────
/**
 * Clears the stored refresh token, effectively ending the session.
 * @param {string} userId
 */
export async function logoutUser(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  })
}

// ── Get Me ────────────────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's public profile.
 * @param {string} userId
 * @returns {object} user
 */
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new AppError('User not found.', HTTP.NOT_FOUND, 'USER_NOT_FOUND')
  }

  return user
}
