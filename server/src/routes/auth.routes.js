// server/src/routes/auth.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth router — mounted at /api/v1/auth in app.js.
//
// Routes:
//   POST   /api/v1/auth/register  — create account
//   POST   /api/v1/auth/login     — sign in
//   POST   /api/v1/auth/refresh   — exchange refresh token for new token pair
//   POST   /api/v1/auth/logout    — sign out (protected)
//   GET    /api/v1/auth/me        — get current user profile (protected)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import authenticate         from '../middleware/authenticate.middleware.js'

const router = Router()

// Public routes
router.post('/register', authController.register)
router.post('/login',    authController.login)
router.post('/refresh',  authController.refresh)

// Protected routes (require valid access token)
router.post('/logout', authenticate, authController.logout)
router.get('/me',      authenticate, authController.getMe)

export default router
