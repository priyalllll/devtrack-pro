// client/src/hooks/useDashboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches all dashboard data in parallel on mount and whenever
// dashboardStore.version increments (triggered by Task/Project CRUD).
//
// Uses Promise.allSettled so a single failing endpoint never blocks others.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as dashboardService from '@services/dashboard.service'
import { useDashboardStore }  from '@store/dashboardStore'

const initialData = {
  summary:   null,
  activities: null,
  todaysTasks: null,
  deadlines:  null,
}

const initialLoading = {
  summary:     true,
  activities:  true,
  todaysTasks: true,
  deadlines:   true,
}

export function useDashboard() {
  const [data,    setData]    = useState(initialData)
  const [loading, setLoading] = useState(initialLoading)
  const [errors,  setErrors]  = useState({})

  // Subscribe to the invalidation version counter
  const version = useDashboardStore((s) => s.version)

  const fetchAll = useCallback(async () => {
    setLoading({ summary: true, activities: true, todaysTasks: true, deadlines: true })
    setErrors({})

    const [summaryRes, activityRes, todayRes, deadlinesRes] = await Promise.allSettled([
      dashboardService.getSummary(),
      dashboardService.getActivity(),
      dashboardService.getTodaysTasks(),
      dashboardService.getUpcomingDeadlines(),
    ])

    setData({
      summary:     summaryRes.status     === 'fulfilled' ? summaryRes.value.data.data     : null,
      activities:  activityRes.status    === 'fulfilled' ? activityRes.value.data.data    : null,
      todaysTasks: todayRes.status       === 'fulfilled' ? todayRes.value.data.data       : null,
      deadlines:   deadlinesRes.status   === 'fulfilled' ? deadlinesRes.value.data.data   : null,
    })

    setErrors({
      summary:     summaryRes.status     === 'rejected' ? summaryRes.reason     : null,
      activities:  activityRes.status    === 'rejected' ? activityRes.reason    : null,
      todaysTasks: todayRes.status       === 'rejected' ? todayRes.reason       : null,
      deadlines:   deadlinesRes.status   === 'rejected' ? deadlinesRes.reason   : null,
    })

    setLoading({ summary: false, activities: false, todaysTasks: false, deadlines: false })
  }, [])

  // Re-fetch on mount AND whenever any CRUD page invalidates the dashboard
  useEffect(() => {
    fetchAll()
  }, [fetchAll, version])

  return { data, loading, errors, refetch: fetchAll }
}
