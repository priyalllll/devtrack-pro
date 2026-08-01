// client/src/components/tasks/TaskModal.jsx
// Shared Create / Edit modal for tasks.
import { useEffect, useState } from 'react'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }         from 'zod'
import clsx          from 'clsx'
import { getProjects } from '@services/project.service'

// ── Validation schema ──────────────────────────────────────────────────────────
const taskSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  projectId:   z.string().min(1, 'Project is required'),
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
      <label className="label">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export default function TaskModal({ task, defaultProjectId, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(task)
  const [projects, setProjects] = useState([])

  // Load available projects for the dropdown
  useEffect(() => {
    getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.data.projects ?? []))
      .catch(() => {})
  }, [])

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      projectId:   task?.projectId   ?? defaultProjectId ?? '',
      status:      task?.status      ?? 'TODO',
      priority:    task?.priority    ?? 'NONE',
      dueDate:     task?.dueDate     ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    },
  })

  useEffect(() => {
    reset({
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      projectId:   task?.projectId   ?? defaultProjectId ?? '',
      status:      task?.status      ?? 'TODO',
      priority:    task?.priority    ?? 'NONE',
      dueDate:     task?.dueDate     ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
  }, [task, defaultProjectId, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-surface-800 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? 'Edit Task' : 'New Task'}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Title */}
          <Field label="Task Title *" error={errors.title?.message}>
            <input
              id="task-title-input"
              {...register('title')}
              placeholder="e.g. Implement authentication flow"
              className={clsx('input', errors.title && 'input-error')}
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
              className="input resize-none"
            />
          </Field>

          {/* Project */}
          <Field label="Project *" error={errors.projectId?.message}>
            <select
              id="task-project-select"
              {...register('projectId')}
              className={clsx('input', errors.projectId && 'input-error')}
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" error={errors.status?.message}>
              <select id="task-status-select" {...register('status')} className="input">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority" error={errors.priority?.message}>
              <select id="task-priority-select" {...register('priority')} className="input">
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
              className="input"
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              id="task-modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting
                ? (isEdit ? 'Saving…'   : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
