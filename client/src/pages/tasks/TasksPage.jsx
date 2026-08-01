// client/src/pages/tasks/TasksPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full tasks management page with search, status/priority/project filters,
// responsive card grid, pagination, create/edit/delete modals.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import toast            from 'react-hot-toast'
import clsx             from 'clsx'
import { useTasks }     from '@hooks/useTasks'
import TaskCard         from '@components/tasks/TaskCard'
import TaskModal        from '@components/tasks/TaskModal'
import TaskDeleteModal  from '@components/tasks/TaskDeleteModal'
import { getProjects }  from '@services/project.service'

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: '',           label: 'All' },
  { key: 'TODO',       label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW',  label: 'In Review' },
  { key: 'DONE',       label: 'Done' },
]
const PRIORITY_OPTS = [
  { key: '',       label: 'All Priorities' },
  { key: 'URGENT', label: '🔴 Urgent' },
  { key: 'HIGH',   label: '🟠 High' },
  { key: 'MEDIUM', label: '🟡 Medium' },
  { key: 'LOW',    label: '🟢 Low' },
  { key: 'NONE',   label: '⚪ None' },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-surface-800/60 border border-surface-700/50 p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-surface-600" />
        <div className="flex-1 h-4 rounded bg-surface-700" />
      </div>
      <div className="h-3 rounded bg-surface-700 w-3/4" />
      <div className="flex gap-2">
        <div className="w-16 h-5 rounded-full bg-surface-700" />
        <div className="w-14 h-5 rounded-full bg-surface-700" />
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ filtered, onNew }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {filtered ? 'No tasks match your filters' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {filtered
          ? 'Try adjusting your search or filters.'
          : 'Create your first task to start tracking work.'}
      </p>
      {!filtered && (
        <button id="empty-state-new-task" onClick={onNew} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create first task
        </button>
      )}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ pagination, onPage }) {
  const { page, totalPages, total } = pagination
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-4 border-t border-surface-700/50">
      <span className="text-xs text-slate-500">{total} task{total !== 1 ? 's' : ''} total</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800 border border-surface-700
                     text-slate-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </button>
        <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800 border border-surface-700
                     text-slate-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { tasks, loading, pagination, refetch, create, update, remove } = useTasks()

  // Filter state
  const [search,        setSearch]        = useState('')
  const [activeStatus,  setActiveStatus]  = useState('')
  const [activePriority,setActivePriority]= useState('')
  const [activeProject, setActiveProject] = useState('')
  const [projects,      setProjects]      = useState([])
  const [currentPage,   setCurrentPage]   = useState(1)

  // Modal state
  const [modalTask,    setModalTask]    = useState(null)  // null=closed, 'new'=create, task=edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting,   setIsDeleting]   = useState(false)
  const searchTimeout = useRef(null)

  // Load project list for filter dropdown
  useEffect(() => {
    getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.data.projects ?? []))
      .catch(() => {})
  }, [])

  // Build & execute query
  const runFetch = useCallback((overrides = {}) => {
    const params = {
      ...(search         && { search }),
      ...(activeStatus   && { status: activeStatus }),
      ...(activePriority && { priority: activePriority }),
      ...(activeProject  && { projectId: activeProject }),
      page: currentPage,
      ...overrides,
    }
    refetch(params)
  }, [search, activeStatus, activePriority, activeProject, currentPage, refetch])

  // Debounced search
  const handleSearch = useCallback((val) => {
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1)
      refetch({
        search:    val || undefined,
        status:    activeStatus   || undefined,
        priority:  activePriority || undefined,
        projectId: activeProject  || undefined,
        page: 1,
      })
    }, 350)
  }, [activeStatus, activePriority, activeProject, refetch])

  // Generic filter change
  const applyFilter = useCallback((patch) => {
    const next = {
      search:    search        || undefined,
      status:    activeStatus  || undefined,
      priority:  activePriority|| undefined,
      projectId: activeProject || undefined,
      page: 1,
      ...patch,
    }
    setCurrentPage(1)
    refetch(next)
  }, [search, activeStatus, activePriority, activeProject, refetch])

  // Create / Edit submit
  const handleSubmit = useCallback(async (data) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate || undefined,
      }
      if (modalTask && modalTask !== 'new') {
        await update(modalTask.id, payload)
        toast.success('Task updated!')
      } else {
        await create(payload)
        toast.success('Task created!')
      }
      setModalTask(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }, [modalTask, create, update])

  // Delete
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast.success('Task deleted.')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete task.')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, remove])

  const isFiltered = Boolean(search || activeStatus || activePriority || activeProject)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${pagination.total} task${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="new-task-btn" onClick={() => setModalTask('new')} className="btn-primary self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col gap-3">
        {/* Search + Project + Priority */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="tasks-search"
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tasks…"
              className="input pl-9"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Project dropdown */}
          <select
            id="tasks-project-filter"
            value={activeProject}
            onChange={(e) => { setActiveProject(e.target.value); applyFilter({ projectId: e.target.value || undefined }) }}
            className="input w-auto min-w-[160px] max-w-[200px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Priority dropdown */}
          <select
            id="tasks-priority-filter"
            value={activePriority}
            onChange={(e) => { setActivePriority(e.target.value); applyFilter({ priority: e.target.value || undefined }) }}
            className="input w-auto min-w-[150px]"
          >
            {PRIORITY_OPTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-800 border border-surface-700/50 w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              id={`status-tab-${tab.key || 'all'}`}
              onClick={() => {
                setActiveStatus(tab.key)
                applyFilter({ status: tab.key || undefined })
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                activeStatus === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Task grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : tasks.length === 0
            ? <EmptyState filtered={isFiltered} onNew={() => setModalTask('new')} />
            : tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setModalTask(t)}
                  onDelete={(t) => setDeleteTarget(t)}
                />
              ))
        }
      </div>

      {/* ── Pagination ── */}
      {!loading && (
        <Pagination
          pagination={{ ...pagination, page: currentPage }}
          onPage={(p) => {
            setCurrentPage(p)
            runFetch({ page: p })
          }}
        />
      )}

      {/* ── Modals ── */}
      {modalTask && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          onClose={() => setModalTask(null)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
      {deleteTarget && (
        <TaskDeleteModal
          task={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
