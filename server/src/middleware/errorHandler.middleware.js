// server/src/middleware/errorHandler.middleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Global error handler — must be the LAST middleware registered in app.js.
//
// Handles:
//   - Zod validation errors (ZodError)
//   - Prisma known request errors (P2002 unique, P2025 not found, etc.)
//   - JWT errors (JsonWebTokenError, TokenExpiredError)
//   - Generic AppError (custom errors with statusCode)
//   - Catch-all 500 Internal Server Error
//
// In production, stack traces and internal Prisma details are hidden.
// ─────────────────────────────────────────────────────────────────────────────

import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import env from '../config/env.js'
import { HTTP } from '../config/constants.js'

// ── Custom application error ──────────────────────────────────────────────────
export class AppError extends Error {
  constructor(message, statusCode = HTTP.INTERNAL_ERROR, code = null) {
    super(message)
    this.statusCode = statusCode
    this.code       = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// ── Error handler middleware ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || HTTP.INTERNAL_ERROR
  let message    = err.message    || 'Internal Server Error'
  let errors     = null
  let code       = err.code       || 'INTERNAL_ERROR'

  // ── Zod Validation Error ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    statusCode = HTTP.UNPROCESSABLE
    message    = 'Validation failed'
    code       = 'VALIDATION_ERROR'
    errors     = err.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }))
  }

  // ── Prisma Known Request Errors ───────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = HTTP.CONFLICT
        message    = `A record with this ${err.meta?.target?.join(', ')} already exists.`
        code       = 'DUPLICATE_ENTRY'
        break
      case 'P2025': // Record not found
        statusCode = HTTP.NOT_FOUND
        message    = 'The requested resource was not found.'
        code       = 'NOT_FOUND'
        break
      case 'P2003': // Foreign key constraint failed
        statusCode = HTTP.BAD_REQUEST
        message    = 'Related resource not found.'
        code       = 'FOREIGN_KEY_ERROR'
        break
      default:
        statusCode = HTTP.INTERNAL_ERROR
        message    = env.isDevelopment ? err.message : 'Database error.'
        code       = 'DATABASE_ERROR'
    }
  }

  // ── Prisma Validation Error ───────────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = HTTP.BAD_REQUEST
    message    = env.isDevelopment ? err.message : 'Invalid data sent to the database.'
    code       = 'DB_VALIDATION_ERROR'
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP.UNAUTHORIZED
    message    = 'Invalid token. Please log in again.'
    code       = 'INVALID_TOKEN'
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP.UNAUTHORIZED
    message    = 'Your session has expired. Please log in again.'
    code       = 'TOKEN_EXPIRED'
  }

  // ── Log the error ─────────────────────────────────────────────────────────
  if (env.isDevelopment) {
    console.error('\n🔴 Error:', {
      statusCode,
      code,
      message,
      stack: err.stack,
    })
  } else if (statusCode >= 500) {
    // In production, only log 5xx errors (don't expose to client)
    console.error('🔴 Server Error:', err.message)
  }

  // ── Send response ─────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(errors && { errors }),
    ...(env.isDevelopment && statusCode >= 500 && { stack: err.stack }),
  })
}

export default errorHandler
