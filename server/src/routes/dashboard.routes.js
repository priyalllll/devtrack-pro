// server/src/routes/dashboard.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard router — mounted at /api/v1/dashboard in app.js.
//
// All routes require a valid access token (authenticate middleware).
//
// Routes:
//   GET /api/v1/dashboard/summary       — stats + 7-day chart data
//   GET /api/v1/dashboard/activity      — recent activity feed
//   GET /api/v1/dashboard/tasks/today   — tasks due today
// ─────────────────────────────────────────────────────────────────────────────

import { Router }         from 'express'
import authenticate       from '../middleware/authenticate.middleware.js'
import * as dashController from '../controllers/dashboard.controller.js'

const router = Router()

// All dashboard routes require authentication
router.use(authenticate)

router.get('/summary',     dashController.getSummary)
router.get('/activity',    dashController.getActivity)
router.get('/tasks/today', dashController.getTodaysTasks)
router.get('/deadlines',   dashController.getUpcomingDeadlines)

export default router
