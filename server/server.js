// server/server.js
// ─────────────────────────────────────────────────────────────────────────────
// Entry point for the Node.js server.
//
// Responsibilities:
//   1. Import and start the Express app
//   2. Connect to the database (verify Prisma can reach Neon PostgreSQL)
//   3. Start the HTTP server on the configured port
//   4. Handle uncaught exceptions and unhandled rejections gracefully
// ─────────────────────────────────────────────────────────────────────────────

import './src/config/env.js'   // ← Validate env vars FIRST, before anything else
import app    from './src/app.js'
import prisma from './src/lib/prisma.js'
import env    from './src/config/env.js'

const PORT = env.PORT

// ── Graceful shutdown helper ──────────────────────────────────────────────────
async function gracefulShutdown(signal, server) {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`)
  server.close(async () => {
    console.log('🔌 HTTP server closed.')
    await prisma.$disconnect()
    console.log('🔌 Database disconnected.')
    process.exit(0)
  })
}

// ── Start server ──────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // 1. Verify database connection
    console.log('🔄 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connected successfully.')

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('\n─────────────────────────────────────────────────')
      console.log(`🚀 DevTrack Pro API`)
      console.log(`   Environment : ${env.NODE_ENV}`)
      console.log(`   Port        : ${PORT}`)
      console.log(`   API Base    : http://localhost:${PORT}/api/v1`)
      console.log(`   Health      : http://localhost:${PORT}/health`)
      console.log('─────────────────────────────────────────────────\n')
    })

    // 3. Graceful shutdown on SIGTERM (Render) and SIGINT (Ctrl+C)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server))
    process.on('SIGINT',  () => gracefulShutdown('SIGINT',  server))

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// ── Unhandled error safety nets ───────────────────────────────────────────────
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection:', reason)
  process.exit(1)
})

startServer()
