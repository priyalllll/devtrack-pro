// server/src/app.js
// ─────────────────────────────────────────────────────────────────────────────
// Express application factory.
// This file configures and assembles the Express app.
// server.js imports this and calls app.listen().
//
// Separation of app.js vs server.js makes the app easier to test (you can
// import the app without starting a server).
// ─────────────────────────────────────────────────────────────────────────────

import express    from 'express'
import helmet     from 'helmet'
import cors       from 'cors'
import morgan     from 'morgan'
import cookieParser from 'cookie-parser'

import env        from './config/env.js'
import { API_PREFIX } from './config/constants.js'
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware.js'
import errorHandler   from './middleware/errorHandler.middleware.js'
import authRoutes      from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import projectRoutes   from './routes/project.routes.js'
import taskRoutes      from './routes/task.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'

const app = express()

// ── Security Headers ──────────────────────────────────────────────────────────
// Helmet sets sensible HTTP headers to protect against common web vulnerabilities
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
// Only allow requests from the configured client origin
app.use(
  cors({
    origin:      env.CLIENT_URL,
    credentials: true,  // Required to accept cookies (refresh token)
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Request Logging ───────────────────────────────────────────────────────────
// 'dev' format: GET /api/v1/projects 200 42ms
// 'combined' format in production for structured log ingest
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'))

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Apply to all /api/v1/* routes
app.use(API_PREFIX, apiLimiter)

// ── Health Check ──────────────────────────────────────────────────────────────
// A lightweight endpoint used by Render, load balancers, and uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status:  'healthy',
    service: 'devtrack-pro-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
// Phase 2: Authentication
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes)

// Phase 3: Dashboard
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes)

// Phase 4: Projects
app.use(`${API_PREFIX}/projects`, projectRoutes)

// Phase 5: Tasks
app.use(`${API_PREFIX}/tasks`, taskRoutes)

// Phase 6: Analytics
app.use(`${API_PREFIX}/analytics`, analyticsRoutes)

// API root info
app.get(API_PREFIX, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevTrack Pro API is running.',
    version: 'v1',
    docs:    'Coming soon',
  })
})

// ── 404 Handler ───────────────────────────────────────────────────────────────
// Any request that does not match a route above falls through to this handler.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code:    'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  })
})

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered LAST, after all routes and middleware.
app.use(errorHandler)

export default app
