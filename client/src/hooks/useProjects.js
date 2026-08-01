// client/src/hooks/useProjects.js
// ─────────────────────────────────────────────────────────────────────────────
// Manages the projects list, CRUD actions, and loading state.
// Search/filter state is managed in the page; this hook exposes a refetch()
// so the page can trigger filtered fetches.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as projectService     from '@services/project.service'
import { useDashboardStore }   from '@store/dashboardStore'

export function useProjects(initialParams = {}) {
  const invalidate   = useDashboardStore((s) => s.invalidate)
  const [projects,   setProjects]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 20, totalPages: 1,
  })

  const fetchProjects = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await projectService.getProjects({ ...initialParams, ...params })
      setProjects(res.data.data.projects)
      setPagination(res.data.data.pagination)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load projects.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ── CRUD mutations (update local state optimistically) ──
  const create = useCallback(async (data) => {
    const res = await projectService.createProject(data)
    const project = res.data.data.project
    setProjects((prev) => [project, ...prev])
    setPagination((p) => ({ ...p, total: p.total + 1 }))
    invalidate()
    return project
  }, [invalidate])

  const update = useCallback(async (id, data) => {
    const res = await projectService.updateProject(id, data)
    const project = res.data.data.project
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)))
    invalidate()
    return project
  }, [invalidate])

  const remove = useCallback(async (id) => {
    await projectService.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }))
    invalidate()
  }, [invalidate])

  return {
    projects, loading, error, pagination,
    refetch: fetchProjects,
    create, update, remove,
  }
}
