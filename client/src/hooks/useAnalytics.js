// client/src/hooks/useAnalytics.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook to fetch analytics overview data.
// Re-fetches automatically whenever dashboardStore.version increments.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as analyticsService from '@services/analytics.service'
import { useDashboardStore }  from '@store/dashboardStore'

export function useAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const version = useDashboardStore((s) => s.version)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await analyticsService.getAnalyticsOverview()
      setData(res.data.data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics, version])

  return { data, loading, error, refetch: fetchAnalytics }
}
