// server/src/routes/analytics.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Analytics Router — mounted at /api/v1/analytics
// Protected by JWT authentication middleware.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import authenticate from '../middleware/authenticate.middleware.js'
import * as analyticsController from '../controllers/analytics.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', analyticsController.getOverview)
router.get('/overview', analyticsController.getOverview)

export default router
