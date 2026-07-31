// server/src/middleware/rateLimit.middleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting middleware using express-rate-limit.
//
// Two limiters are exported:
//   - `apiLimiter`  — applied to all /api/v1/* routes (100 req / 15 min)
//   - `authLimiter` — applied only to /api/v1/auth/* routes (10 req / 15 min)
//                     to prevent brute-force attacks on login/register.
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit'
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
  HTTP,
} from '../config/constants.js'

// ── Standard API limiter ───────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max:      RATE_LIMIT_MAX,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false,  // Disable the X-RateLimit-* headers (deprecated)
  message: {
    success: false,
    code:    'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
  statusCode: HTTP.BAD_REQUEST,
  skip: (req) => {
    // Skip rate limiting in test environments
    return process.env.NODE_ENV === 'test'
  },
})

// ── Auth-specific stricter limiter ────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max:      AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    code:    'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
  statusCode: HTTP.BAD_REQUEST,
  skip: (req) => process.env.NODE_ENV === 'test',
})
