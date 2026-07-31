// server/src/config/env.js
// ─────────────────────────────────────────────────────────────────────────────
// Validates all required environment variables on server startup.
// Throws a clear error message if any are missing so the app fails fast
// instead of producing cryptic runtime errors later.
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config'

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
]

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌  Missing required environment variables:')
    missing.forEach((key) => console.error(`   - ${key}`))
    console.error('\n   Copy server/.env.example to server/.env and fill in all values.\n')
    process.exit(1)
  }
}

validateEnv()

// ── Exported config object ───────────────────────────────────────────────────
const env = {
  // Server
  NODE_ENV:  process.env.NODE_ENV  || 'development',
  PORT:      parseInt(process.env.PORT || '5000', 10),

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_ACCESS_SECRET:     process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET:    process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Helpers
  isProduction:  process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
}

export default env
