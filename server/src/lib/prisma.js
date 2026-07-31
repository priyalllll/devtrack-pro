// server/src/lib/prisma.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton PrismaClient instance.
//
// Why singleton?
//   In development, hot-reload (nodemon) re-executes modules on every file
//   save. Without this pattern, each reload creates a NEW PrismaClient,
//   eventually exhausting the database connection pool.
//
//   The global `_prisma` trick ensures only one instance is ever created
//   per Node.js process lifetime.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client'
import env from '../config/env.js'

// Log queries in development, only errors in production
const logLevels = env.isDevelopment
  ? ['query', 'info', 'warn', 'error']
  : ['error']

const createPrismaClient = () =>
  new PrismaClient({
    log: logLevels,
  })

// Attach to globalThis to survive hot reloads in development
const globalForPrisma = globalThis

const prisma = globalForPrisma._prisma ?? createPrismaClient()

if (env.isDevelopment) {
  globalForPrisma._prisma = prisma
}

export default prisma
