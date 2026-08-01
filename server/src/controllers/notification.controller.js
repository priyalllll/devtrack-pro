// server/src/controllers/notification.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Notification HTTP handlers.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import * as notifService from '../services/notification.service.js'

function getUserId(req) {
  const id = req.user?.id || req.user?.userId
  if (!id) throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  return id
}

// ── GET /notifications ────────────────────────────────────────────────────────
export async function listNotifications(req, res, next) {
  try {
    const userId = getUserId(req)
    const result = await notifService.getUserNotifications(userId)
    return res.status(HTTP.OK).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /notifications/:id/read ─────────────────────────────────────────────
export async function markAsRead(req, res, next) {
  try {
    const userId = getUserId(req)
    const updated = await notifService.markNotificationAsRead(req.params.id, userId)
    return res.status(HTTP.OK).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification: updated },
    })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /notifications/read-all ──────────────────────────────────────────────
export async function markAllAsRead(req, res, next) {
  try {
    const userId = getUserId(req)
    await notifService.markAllNotificationsAsRead(userId)
    return res.status(HTTP.OK).json({
      success: true,
      message: 'All notifications marked as read.',
    })
  } catch (err) {
    next(err)
  }
}
