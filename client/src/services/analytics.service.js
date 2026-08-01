// client/src/services/analytics.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Analytics API wrappers.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

export const getAnalyticsOverview = () => api.get('/analytics/overview')
