// client/src/pages/projects/ProjectsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full projects management page.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { useProjects }         from '@hooks/useProjects'
import ProjectCard             from '@components/projects/ProjectCard'
import ProjectModal            from '@components/projects/ProjectModal'
import DeleteConfirmModal      from '@components/projects/DeleteConfirmModal'
import MembersModal            from '@components/projects/MembersModal'

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: '',          label: 'All' },
  { key: 'ACTIVE',    label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'ARCHIVED',  label: 'Archived' },
]

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-surface-800/60 border border-surface-700/50 overflow-hidden animate-pulse">
      <div className="h-1 bg-surface-600" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-700 flex-shrink-0" />
          <div className="flex-1 h-4 rounded bg-surface-700" />
        </div>
        <div className="h-3 rounded bg-surface-700 w-3/4" />
        <div className="h-3 rounded bg-surface-700 w-1/2" />
        <div className="pt-3 border-t border-surface-700/50 flex justify-between">
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-surface-700" />)}
          </div>
          <div className="w-20 h-6 rounded-lg bg-surface-700" />
        </div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ filtered, onNew }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {filtered ? 'No projects match your filters' : 'No projects yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {filtered
          ? 'Try changing your search or filter to find what you\'re looking for.'
          : 'Create your first project to start tracking tasks, managing your team, and shipping faster.'}
      </p>
      {!filtered && (
        <button id="empty-state-new-project" onClick={onNew} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create your first project
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects, loading, refetch, create, update, remove } = useProjects()

  // ── Local UI state ──
  const [search,        setSearch]        = useState('')
  const [activeStatus,  setActiveStatus]  = useState('')
  const [modalProject,  setModalProject]  = useState(null)  // null = closed, object = edit, 'new' = create
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [membersProject, setMembersProject] = useState(null)
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [isDeleting,    setIsDeleting]    = useState(false)
  const searchTimeout = useRef(null)

  // ── Debounced search ──
  const handleSearchChange = useCallback((value) => {
    setSearch(value)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      refetch({ search: value || undefined, status: activeStatus || undefined })
    }, 350)
  }, [activeStatus, refetch])

  // ── Status filter ──
  const handleStatusChange = useCallback((status) => {
    setActiveStatus(status)
    refetch({ status: status || undefined, search: search || undefined })
  }, [search, refetch])

  // ── Create / Edit submit ──
  const handleSubmit = useCallback(async (data) => {
    setIsSubmitting(true)
    try {
      if (modalProject && modalProject !== 'new') {
        await update(modalProject.id, data)
        toast.success('Project updated!')
      } else {
        await create(data)
        toast.success('Project created!')
      }
      setModalProject(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }, [modalProject, create, update])

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast.success('Project deleted.')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete project.')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, remove])

  const isFiltered = Boolean(search || activeStatus)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => setModalProject('new')}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="projects-search"
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects…"
            className="input pl-9"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-800 border border-surface-700/50">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              id={`filter-${tab.key || 'all'}`}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeStatus === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Project grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : projects.length === 0
            ? <EmptyState filtered={isFiltered} onNew={() => setModalProject('new')} />
            : projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => setModalProject(p)}
                  onDelete={(p) => setDeleteTarget(p)}
                  onManageMembers={(p) => setMembersProject(p)}
                />
              ))
        }
      </div>

      {/* ── Modals ── */}
      {modalProject && (
        <ProjectModal
          project={modalProject === 'new' ? null : modalProject}
          onClose={() => setModalProject(null)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {membersProject && (
        <MembersModal
          project={membersProject}
          onClose={() => {
            setMembersProject(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
