// client/src/components/dashboard/TodaysTasks.jsx
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', class: 'bg-red-500/15 text-red-400 border-red-500/30'       },
  HIGH:   { label: 'High',   class: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  MEDIUM: { label: 'Medium', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30'  },
  LOW:    { label: 'Low',    class: 'bg-slate-500/15 text-slate-400 border-slate-500/30'  },
  NONE:   { label: '',       class: 'bg-slate-500/15 text-slate-400 border-slate-500/30'  },
}

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       class: 'bg-slate-500/15 text-slate-400'  },
  IN_PROGRESS: { label: 'In Progress', class: 'bg-blue-500/15 text-blue-400'    },
  IN_REVIEW:   { label: 'In Review',   class: 'bg-purple-500/15 text-purple-400'},
  DONE:        { label: 'Done',        class: 'bg-green-500/15 text-green-400'  },
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function TaskRow({ task }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.NONE
  const status   = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.TODO
  const isDone   = task.status === 'DONE'

  return (
    <div className={clsx(
      'flex items-start gap-3 p-3 rounded-xl transition-all duration-150',
      'hover:bg-surface-700/40 group',
      isDone && 'opacity-60',
    )}>
      {/* Status indicator */}
      <div className={clsx(
        'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
        isDone
          ? 'bg-green-500 border-green-500'
          : 'border-surface-600 group-hover:border-primary-500',
      )}>
        {isDone && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium truncate', isDone ? 'line-through text-slate-500' : 'text-slate-200')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {priority.label && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium border', priority.class)}>
              {priority.label}
            </span>
          )}
          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', status.class)}>
            {status.label}
          </span>
          {task.project && (
            <span className="text-xs text-slate-600 truncate">{task.project}</span>
          )}
        </div>
      </div>

      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0 mt-0.5">
        {formatTime(task.dueDate)}
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 p-3 animate-pulse">
      <div className="w-4 h-4 rounded-full bg-surface-700 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-3 rounded bg-surface-700" />
        <div className="flex gap-2">
          <div className="w-14 h-3 rounded-full bg-surface-700" />
          <div className="w-18 h-3 rounded-full bg-surface-700" />
        </div>
      </div>
    </div>
  )
}

function EmptyTasks({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 font-medium">No tasks for today</p>
      <p className="text-xs text-slate-600 mt-1">Create a task or set a due date</p>
    </div>
  )
}

export default function TodaysTasks({ tasks, loading }) {
  const navigate = useNavigate()
  const list  = tasks ?? []
  const total = list.length
  const done  = list.filter((t) => t.status === 'DONE').length

  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Today's Tasks</h3>
          {!loading && (
            <p className="text-sm text-slate-500 mt-0.5">
              {total === 0 ? 'No tasks' : `${done}/${total} completed`}
            </p>
          )}
        </div>
        <button
          id="dashboard-add-task"
          onClick={() => navigate('/tasks')}
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          Add task →
        </button>
      </div>

      {/* Progress bar */}
      {!loading && total > 0 && (
        <div className="h-1.5 bg-surface-700 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-1">
        {loading
          ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
          : total === 0
            ? <EmptyTasks />
            : list.map((t) => <TaskRow key={t.id} task={t} />)
        }
      </div>
    </div>
  )
}
