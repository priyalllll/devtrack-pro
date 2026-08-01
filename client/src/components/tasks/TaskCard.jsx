// client/src/components/tasks/TaskCard.jsx
import { format, isValid, isPast } from 'date-fns'
import clsx from 'clsx'

const PRIORITY_CONFIG = {
  NONE:   { label: 'None',   dot: 'bg-slate-400',  cls: 'badge-priority-none'   },
  LOW:    { label: 'Low',    dot: 'bg-green-400',  cls: 'badge-priority-low'    },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400',  cls: 'badge-priority-medium' },
  HIGH:   { label: 'High',   dot: 'bg-red-400',    cls: 'badge-priority-high'   },
  URGENT: { label: 'Urgent', dot: 'bg-red-600',    cls: 'badge-priority-urgent' },
}

const STATUS_CONFIG = {
  TODO:        { label: 'Todo',        cls: 'badge-status-todo'        },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-status-in_progress' },
  IN_REVIEW:   { label: 'In Review',   cls: 'badge-status-in_review'   },
  DONE:        { label: 'Done',        cls: 'badge-status-done'        },
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.NONE
  const status   = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.TODO
  const dueDate  = task.dueDate ? new Date(task.dueDate) : null
  const overdue  = dueDate && isValid(dueDate) && isPast(dueDate) && task.status !== 'DONE'

  return (
    <div
      className={clsx(
        'group flex flex-col gap-3 p-4 rounded-2xl',
        'bg-surface-800/60 border border-surface-700/50',
        'hover:border-surface-600 hover:-translate-y-0.5 hover:shadow-lg',
        'transition-all duration-200',
        task.status === 'DONE' && 'opacity-70',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {/* Priority dot */}
          <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', priority.dot)} />
          <h3 className={clsx(
            'text-sm font-medium text-white leading-snug',
            task.status === 'DONE' && 'line-through text-slate-400',
          )}>
            {task.title}
          </h3>
        </div>
        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
          <button
            id={`task-edit-${task.id}`}
            onClick={() => onEdit(task)}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-surface-700 transition-all"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            id={`task-delete-${task.id}`}
            onClick={() => onDelete(task)}
            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={status.cls}>{status.label}</span>
        {task.priority !== 'NONE' && (
          <span className={priority.cls}>{priority.label}</span>
        )}
        {task.project && (
          <span
            className="badge text-xs"
            style={{
              background: task.project.color + '20',
              color:      task.project.color,
              border:     `1px solid ${task.project.color}35`,
            }}
          >
            {task.project.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-surface-700/50">
        {/* Due date */}
        <div className={clsx('flex items-center gap-1 text-xs', overdue ? 'text-red-400' : 'text-slate-500')}>
          {dueDate && isValid(dueDate) && (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(dueDate, 'MMM d')}{overdue ? ' · Overdue' : ''}</span>
            </>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[9px] font-bold text-white"
            title={task.assignee.name}
          >
            {task.assignee.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
