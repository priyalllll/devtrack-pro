// server/src/controllers/analytics.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Controller handler for analytics endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import * as analyticsService from '../services/analytics.service.js'

function getUserId(req) {
  const id = req.user?.id || req.user?.userId
  if (!id) throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  return id
}

// ── GET /analytics/overview ────────────────────────────────────────────────────
export async function getOverview(req, res, next) {
  try {
    const userId = getUserId(req)
    const analytics = await analyticsService.getAnalytics(userId)
    return res.status(HTTP.OK).json({
      success: true,
      data: analytics,
    })
  } catch (err) {
    next(err)
  }
}
