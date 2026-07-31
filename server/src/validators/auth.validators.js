// server/src/validators/auth.validators.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for auth route request body validation.
// Used inside controllers via validate() helper or direct .parse().
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ── Register ──────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be at most 80 characters.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(8,  'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.')  // bcrypt hard limit
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    ),
})

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
})

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required.' })
    .min(1, 'Refresh token is required.'),
})
