// client/src/services/dashboard.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard API call wrappers.
// All 4 endpoints return real DB data.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

export const getSummary         = ()  => api.get('/dashboard/summary')
export const getActivity        = ()  => api.get('/dashboard/activity')
export const getTodaysTasks     = ()  => api.get('/dashboard/tasks/today')
export const getUpcomingDeadlines = () => api.get('/dashboard/deadlines')
