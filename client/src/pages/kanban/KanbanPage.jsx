// client/src/pages/kanban/KanbanPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// DevTrack Pro — Kanban Board Page
// Features: Drag and Drop with live DB sync, Search, Project & Priority filters,
//           Task CRUD modals, responsive layout, dark aesthetic matching DevTrack Pro.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import clsx from 'clsx'

import * as taskService    from '@services/task.service'
import { getProjects }    from '@services/project.service'
import { useDashboardStore } from '@store/dashboardStore'

import KanbanColumn     from '@components/kanban/KanbanColumn'
import TaskModal        from '@components/tasks/TaskModal'
import TaskDeleteModal  from '@components/tasks/TaskDeleteModal'

// Column definitions matching DevTrack Pro backend TaskStatus enum
const KANBAN_COLUMNS = [
  {
    id:       'TODO',
    title:    'Todo',
    dotBg:    'bg-blue-500',
    badgeCls: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  {
    id:       'IN_PROGRESS',
    title:    'In Progress',
    dotBg:    'bg-amber-500',
    badgeCls: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  {
    id:       'IN_REVIEW',
    title:    'In Review',
    dotBg:    'bg-purple-500',
    badgeCls: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  },
  {
    id:       'DONE',
    title:    'Done',
    dotBg:    'bg-green-500',
    badgeCls: 'bg-green-500/15 text-green-400 border border-green-500/20',
  },
]

const PRIORITY_OPTS = [
  { key: '',       label: 'All Priorities' },
  { key: 'URGENT', label: '🔴 Urgent' },
  { key: 'HIGH',   label: '🟠 High' },
  { key: 'MEDIUM', label: '🟡 Medium' },
  { key: 'LOW',    label: '🟢 Low' },
  { key: 'NONE',   label: '⚪ None' },
]

function ColumnSkeleton() {
  return (
    <div className="flex flex-col w-full min-w-[280px] max-w-sm rounded-2xl bg-surface-900/60 border border-surface-800/80 p-3.5 animate-pulse">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-800">
        <div className="w-24 h-4 rounded bg-surface-800" />
        <div className="w-6 h-6 rounded-lg bg-surface-800" />
      </div>
      <div className="space-y-3 min-h-[400px]">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-800/50" />
        ))}
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [projects, setProjects]   = useState([])
  
  // Filters
  const [search, setSearch]               = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')

  // Modals
  const [modalTask, setModalTask]       = useState(null) // null = closed, 'new' = create, task = edit
  const [modalDefaultStatus, setModalDefaultStatus] = useState('TODO')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting]     = useState(false)

  // Invalidation for dashboard sync
  const invalidateDashboard = useDashboardStore((s) => s.invalidate)

  // Fetch projects for filter dropdown
  useEffect(() => {
    getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.data.projects ?? []))
      .catch(() => {})
  }, [])

  // Fetch all tasks for Kanban
  const fetchKanbanTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taskService.getTasks({ limit: 100 })
      setTasks(res.data.data.tasks ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load tasks for board.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKanbanTasks()
  }, [fetchKanbanTasks])

  // Filter tasks based on search & selectors
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search term
      if (search) {
        const q = search.toLowerCase()
        const matchTitle = t.title?.toLowerCase().includes(q)
        const matchDesc  = t.description?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc) return false
      }
      // Project filter
      if (selectedProject && t.projectId !== selectedProject) return false
      // Priority filter
      if (selectedPriority && t.priority !== selectedPriority) return false
      return true
    })
  }, [tasks, search, selectedProject, selectedPriority])

  // Organize tasks by column ID
  const tasksByColumn = useMemo(() => {
    const map = {
      TODO:        [],
      IN_PROGRESS: [],
      IN_REVIEW:   [],
      DONE:        [],
    }
    filteredTasks.forEach((task) => {
      const colId = map[task.status] ? task.status : 'TODO'
      map[colId].push(task)
    })
    return map
  }, [filteredTasks])

  // Drag & Drop End Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId
    const targetTask = tasks.find((t) => t.id === draggableId)
    if (!targetTask) return

    // Optimistic UI Update
    const prevTasks = [...tasks]
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    )

    try {
      // Sync with backend API
      await taskService.updateTask(draggableId, { status: newStatus })
      toast.success(`Task moved to ${KANBAN_COLUMNS.find(c => c.id === newStatus)?.title ?? newStatus}`)
      invalidateDashboard()
    } catch (err) {
      // Rollback on error
      setTasks(prevTasks)
      toast.error(err?.response?.data?.message ?? 'Failed to update task position.')
    }
  }

  // Create or Update Task handler
  const handleSubmitTask = async (data) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate || undefined,
      }

      if (modalTask && modalTask !== 'new') {
        const res = await taskService.updateTask(modalTask.id, payload)
        const updated = res.data.data.task
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        toast.success('Task updated!')
      } else {
        const res = await taskService.createTask(payload)
        const created = res.data.data.task
        setTasks((prev) => [created, ...prev])
        toast.success('Task created!')
      }
      invalidateDashboard()
      setModalTask(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Task handler
  const handleDeleteTask = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await taskService.deleteTask(deleteTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Task deleted.')
      invalidateDashboard()
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete task.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Quick Add Trigger from Column Header
  const handleQuickAdd = (status) => {
    setModalDefaultStatus(status)
    setModalTask('new')
  }

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">

      {/* ── Page Header & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Kanban Board
            <span className="text-xs font-normal text-slate-400 bg-surface-800 border border-surface-700 px-2.5 py-0.5 rounded-full">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Visualize workflow, reorder tasks, and manage project execution
          </p>
        </div>

        <button
          id="kanban-new-task-btn"
          onClick={() => handleQuickAdd('TODO')}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-surface-900/60 border border-surface-800/80">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="kanban-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search board…"
            className="input pl-9 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Project Selector */}
        <select
          id="kanban-project-filter"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="input w-auto min-w-[160px] max-w-[220px] text-xs"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Priority Selector */}
        <select
          id="kanban-priority-filter"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="input w-auto min-w-[150px] text-xs"
        >
          {PRIORITY_OPTS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        {/* Clear Filters reset button */}
        {(search || selectedProject || selectedPriority) && (
          <button
            onClick={() => { setSearch(''); setSelectedProject(''); setSelectedPriority('') }}
            className="btn-ghost text-xs text-slate-400 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Board View ── */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {KANBAN_COLUMNS.map((col) => (
            <ColumnSkeleton key={col.id} />
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar min-h-[550px] items-start">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] ?? []}
                onEditTask={(t) => setModalTask(t)}
                onDeleteTask={(t) => setDeleteTarget(t)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* ── Modals ── */}
      {modalTask && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          defaultProjectId={selectedProject || undefined}
          onClose={() => setModalTask(null)}
          onSubmit={handleSubmitTask}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteTarget && (
        <TaskDeleteModal
          task={deleteTarget}
          onConfirm={handleDeleteTask}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

    </div>
  )
}
