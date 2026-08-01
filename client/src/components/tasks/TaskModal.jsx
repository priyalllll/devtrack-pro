// client/src/components/tasks/TaskModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared Create / Edit modal for tasks.
// Enhanced with Assignee selection & Live Task Comments.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }         from 'zod'
import clsx          from 'clsx'
import toast         from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

import { getProjects } from '@services/project.service'
import { getProjectMembers } from '@services/member.service'
import { getTaskComments, createTaskComment, deleteTaskComment } from '@services/comment.service'
import { useAuthStore } from '@store/authStore'
import { useDashboardStore } from '@store/dashboardStore'

// ── Validation schema ──────────────────────────────────────────────────────────
const taskSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  projectId:   z.string().min(1, 'Project is required'),
  assigneeId:  z.string().optional().nullable(),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority:    z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('NONE'),
  dueDate:     z.string().optional(),
})

const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'Todo'        },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW',   label: 'In Review'   },
  { value: 'DONE',        label: 'Done'        },
]

const PRIORITY_OPTIONS = [
  { value: 'NONE',   label: 'None'   },
  { value: 'LOW',    label: 'Low'    },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High'   },
  { value: 'URGENT', label: 'Urgent' },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export default function TaskModal({ task, defaultProjectId, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(task)
  const { user: currentUser } = useAuthStore()
  const invalidateDashboard = useDashboardStore((s) => s.invalidate)

  const [projects, setProjects] = useState([])
  const [members, setMembers]   = useState([])
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment]           = useState('')
  const [postingComment, setPostingComment]   = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      projectId:   task?.projectId   ?? defaultProjectId ?? '',
      assigneeId:  task?.assigneeId  ?? task?.assignee?.id ?? '',
      status:      task?.status      ?? 'TODO',
      priority:    task?.priority    ?? 'NONE',
      dueDate:     task?.dueDate     ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    },
  })

  const selectedProjectId = watch('projectId')

  // Load projects
  useEffect(() => {
    getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.data.projects ?? []))
      .catch(() => {})
  }, [])

  // Load project members when project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([])
      return
    }
    getProjectMembers(selectedProjectId)
      .then((res) => setMembers(res.data.data.members ?? []))
      .catch(() => setMembers([]))
  }, [selectedProjectId])

  // Load comments for existing task
  const fetchComments = useCallback(async () => {
    if (!task?.id) return
    setLoadingComments(true)
    try {
      const res = await getTaskComments(task.id)
      setComments(res.data.data.comments ?? [])
    } catch {
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }, [task?.id])

  useEffect(() => {
    if (isEdit) fetchComments()
  }, [isEdit, fetchComments])

  // Post comment
  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !task?.id) return

    setPostingComment(true)
    try {
      const res = await createTaskComment(task.id, newComment.trim())
      setComments((prev) => [...prev, res.data.data.comment])
      setNewComment('')
      toast.success('Comment posted!')
      invalidateDashboard()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to post comment.')
    } finally {
      setPostingComment(false)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteTaskComment(task.id, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Comment deleted.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete comment.')
    }
  }

  useEffect(() => {
    reset({
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      projectId:   task?.projectId   ?? defaultProjectId ?? '',
      assigneeId:  task?.assigneeId  ?? task?.assignee?.id ?? '',
      status:      task?.status      ?? 'TODO',
      priority:    task?.priority    ?? 'NONE',
      dueDate:     task?.dueDate     ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
  }, [task, defaultProjectId, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-surface-800 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? 'Edit Task Details' : 'New Task'}
            </h2>
          </div>
          <button
            id="task-modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-surface-700 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Title */}
          <Field label="Task Title *" error={errors.title?.message}>
            <input
              id="task-title-input"
              {...register('title')}
              placeholder="e.g. Implement authentication flow"
              className={clsx('input text-xs', errors.title && 'input-error')}
              autoFocus
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description?.message}>
            <textarea
              id="task-description-input"
              {...register('description')}
              placeholder="Describe what needs to be done…"
              rows={3}
              className="input text-xs resize-none"
            />
          </Field>

          {/* Project & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Project *" error={errors.projectId?.message}>
              <select
                id="task-project-select"
                {...register('projectId')}
                className={clsx('input text-xs', errors.projectId && 'input-error')}
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Assignee" error={errors.assigneeId?.message}>
              <select
                id="task-assignee-select"
                {...register('assigneeId')}
                className="input text-xs"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name ?? m.user?.email} ({m.role})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" error={errors.status?.message}>
              <select id="task-status-select" {...register('status')} className="input text-xs">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority" error={errors.priority?.message}>
              <select id="task-priority-select" {...register('priority')} className="input text-xs">
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Due Date */}
          <Field label="Due Date" error={errors.dueDate?.message}>
            <input
              id="task-due-date"
              type="date"
              {...register('dueDate')}
              className="input text-xs"
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-b border-surface-700 pb-4">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">Cancel</button>
            <button
              id="task-modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs min-w-[120px]"
            >
              {isSubmitting
                ? (isEdit ? 'Saving…'   : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
          </div>

          {/* ── Task Comments Section (Visible when editing) ── */}
          {isEdit && (
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Task Discussion ({comments.length})
              </h3>

              {/* Comments Feed */}
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {loadingComments ? (
                  <p className="text-xs text-slate-500 py-2">Loading comments…</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No comments yet. Start the conversation!</p>
                ) : (
                  comments.map((c) => {
                    let timeAgo = ''
                    try { timeAgo = formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) } catch { timeAgo = '' }

                    return (
                      <div key={c.id} className="p-3 rounded-xl bg-surface-900/60 border border-surface-700/60 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary-500/80 flex items-center justify-center font-bold text-[9px] text-white">
                              {c.author?.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="font-semibold text-slate-200">{c.author?.name ?? 'User'}</span>
                            <span className="text-[10px] text-slate-500">{timeAgo}</span>
                          </div>

                          {(c.authorId === currentUser?.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed pl-7">{c.content}</p>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  className="input text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePostComment(e)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handlePostComment}
                  disabled={postingComment || !newComment.trim()}
                  className="btn-primary text-xs px-3"
                >
                  {postingComment ? 'Posting…' : 'Comment'}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}
