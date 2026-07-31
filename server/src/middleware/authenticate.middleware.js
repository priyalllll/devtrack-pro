// server/src/middleware/authenticate.middleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication middleware — protects routes that require a logged-in user.
//
// Usage:
//   import authenticate from './middleware/authenticate.middleware.js'
//   router.get('/me', authenticate, controller)
//
// Reads the JWT from: Authorization: Bearer <token>
// On success: attaches req.user = { userId, role } and calls next()
// On failure: throws AppError(401)
// ─────────────────────────────────────────────────────────────────────────────

import { verifyAccessToken } from '../utils/jwt.utils.js'
import { AppError } from './errorHandler.middleware.js'
import { HTTP } from '../config/constants.js'

/**
 * Middleware: verify access token and attach user to request.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required. Please log in.',
        HTTP.UNAUTHORIZED,
        'NO_TOKEN',
      )
    }

    const token   = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    // Attach decoded payload to request for downstream use
    req.user = {
      userId: payload.userId,
      role:   payload.role,
    }

    next()
  } catch (err) {
    // Re-throw AppErrors directly; let JWT errors fall through to global handler
    next(err)
  }
}

export default authenticate

/**
 * Factory: restrict access to specific app-level roles.
 * Usage: requireRole('ADMIN')
 *
 * @param {...string} roles — one or more AppRole enum values ('ADMIN', 'USER')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'NO_TOKEN'))
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        'You do not have permission to perform this action.',
        HTTP.FORBIDDEN,
        'FORBIDDEN',
      ),
    )
  }

  next()
}
