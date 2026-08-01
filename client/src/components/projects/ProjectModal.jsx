// client/src/components/projects/ProjectModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared Create / Edit modal.
// When `project` prop is provided → Edit mode (PUT).
// When `project` is null          → Create mode (POST).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import clsx from 'clsx'

// ── Validation ─────────────────────────────────────────────────────────────────
const projectSchema = z.object({
  name:        z.string().min(1, 'Project name is required').max(80, 'Max 80 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  color:       z.string().default('#6366f1'),
  status:      z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).default('ACTIVE'),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
})

// ── Preset colours ─────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ef4444', '#f59e0b', '#10b981', '#14b8a6',
]

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function ProjectModal({ project, onClose, onSubmit, isSubmitting }) {
  const isEdit = Boolean(project)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name:        project?.name        ?? '',
      description: project?.description ?? '',
      color:       project?.color       ?? '#6366f1',
      status:      project?.status      ?? 'ACTIVE',
      startDate:   project?.startDate   ? project.startDate.split('T')[0] : '',
      endDate:     project?.endDate     ? project.endDate.split('T')[0]   : '',
    },
  })

  // Re-populate form if editing a different project
  useEffect(() => {
    reset({
      name:        project?.name        ?? '',
      description: project?.description ?? '',
      color:       project?.color       ?? '#6366f1',
      status:      project?.status      ?? 'ACTIVE',
      startDate:   project?.startDate   ? project.startDate.split('T')[0] : '',
      endDate:     project?.endDate     ? project.endDate.split('T')[0]   : '',
    })
  }, [project, reset])

  const selectedColor = watch('color')

  const handleFormSubmit = (values) => {
    onSubmit({
      ...values,
      startDate: values.startDate || undefined,
      endDate:   values.endDate   || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-800 rounded-2xl shadow-modal
                      border border-surface-700 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: selectedColor + '25' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={selectedColor} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
          </div>
          <button
            id="project-modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                       hover:bg-surface-700 hover:text-white transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">

          {/* Name */}
          <Field label="Project Name *" error={errors.name?.message}>
            <input
              id="project-name-input"
              {...register('name')}
              placeholder="e.g. DevTrack Pro"
              className={clsx('input', errors.name && 'input-error')}
              autoFocus
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description?.message}>
            <textarea
              id="project-description-input"
              {...register('description')}
              placeholder="What is this project about?"
              rows={3}
              className={clsx('input resize-none', errors.description && 'input-error')}
            />
          </Field>

          {/* Color picker */}
          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={clsx(
                    'w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110',
                    selectedColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-surface-800 scale-110',
                  )}
                  style={{ background: c }}
                  title={c}
                />
              ))}
              {/* Custom hex input */}
              <div className="flex items-center gap-1.5 ml-1">
                <div className="w-5 h-5 rounded" style={{ background: selectedColor }} />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                      setValue('color', e.target.value)
                    }
                  }}
                  className="w-24 px-2 py-1 rounded-lg bg-surface-700 border border-surface-600
                             text-xs text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <Field label="Status" error={errors.status?.message}>
            <select
              id="project-status-select"
              {...register('status')}
              className="input"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" error={errors.startDate?.message}>
              <input
                id="project-start-date"
                type="date"
                {...register('startDate')}
                className="input"
              />
            </Field>
            <Field label="End Date" error={errors.endDate?.message}>
              <input
                id="project-end-date"
                type="date"
                {...register('endDate')}
                className="input"
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              id="project-modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting
                ? (isEdit ? 'Saving…' : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Project')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
