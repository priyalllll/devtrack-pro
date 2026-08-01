// client/src/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react'
import * as taskService        from '@services/task.service'
import { useDashboardStore }   from '@store/dashboardStore'

export function useTasks(initialParams = {}) {
  const invalidate   = useDashboardStore((s) => s.invalidate)
  const [tasks,      setTasks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 20, totalPages: 1,
  })

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await taskService.getTasks({ ...initialParams, ...params })
      setTasks(res.data.data.tasks)
      setPagination(res.data.data.pagination)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const create = useCallback(async (data) => {
    const res = await taskService.createTask(data)
    const task = res.data.data.task
    setTasks((prev) => [task, ...prev])
    setPagination((p) => ({ ...p, total: p.total + 1 }))
    invalidate()
    return task
  }, [invalidate])

  const update = useCallback(async (id, data) => {
    const res = await taskService.updateTask(id, data)
    const task = res.data.data.task
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)))
    invalidate()
    return task
  }, [invalidate])

  const remove = useCallback(async (id) => {
    await taskService.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }))
    invalidate()
  }, [invalidate])

  return {
    tasks, loading, error, pagination,
    refetch: fetchTasks,
    create, update, remove,
  }
}
