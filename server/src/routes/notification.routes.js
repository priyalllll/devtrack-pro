// server/src/routes/notification.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Notification router — mounted at /api/v1/notifications
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express'
import authenticate from '../middleware/authenticate.middleware.js'
import * as notifController from '../controllers/notification.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', notifController.listNotifications)
router.patch('/read-all', notifController.markAllAsRead)
router.patch('/:id/read', notifController.markAsRead)

export default router
