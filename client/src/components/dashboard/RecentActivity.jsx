// client/src/components/dashboard/RecentActivity.jsx
import { formatDistanceToNow } from 'date-fns'

const ACTION_CONFIG = {
  'task.completed':  { label: 'Completed',   bg: 'bg-green-500/15',   text: 'text-green-400',  dot: 'bg-green-500'   },
  'task.created':    { label: 'Created task', bg: 'bg-primary-500/15', text: 'text-primary-400',dot: 'bg-primary-500' },
  'task.updated':    { label: 'Updated task', bg: 'bg-blue-500/15',    text: 'text-blue-400',   dot: 'bg-blue-500'    },
  'task.moved':      { label: 'Moved task',   bg: 'bg-blue-500/15',    text: 'text-blue-400',   dot: 'bg-blue-500'    },
  'task.deleted':    { label: 'Deleted task', bg: 'bg-red-500/15',     text: 'text-red-400',    dot: 'bg-red-500'     },
  'comment.added':   { label: 'Commented',    bg: 'bg-purple-500/15',  text: 'text-purple-400', dot: 'bg-purple-500'  },
  'project.created': { label: 'New project',  bg: 'bg-amber-500/15',   text: 'text-amber-400',  dot: 'bg-amber-500'   },
  'project.updated': { label: 'Updated',      bg: 'bg-slate-500/15',   text: 'text-slate-400',  dot: 'bg-slate-500'   },
  'member.added':    { label: 'Added member', bg: 'bg-teal-500/15',    text: 'text-teal-400',   dot: 'bg-teal-500'    },
}

function ActivityRow({ activity, isLast }) {
  const cfg = ACTION_CONFIG[activity.action] ?? {
    label: activity.action,
    bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-500',
  }

  let timeAgo = ''
  try {
    timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
  } catch { timeAgo = '' }

  const avatarColor = activity.projectColor ?? activity.actorColor ?? '#6366f1'

  return (
    <div className="flex gap-3 group">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: avatarColor }}
        >
          {activity.actorName?.[0]?.toUpperCase() ?? '?'}
        </div>
        {!isLast && <div className="w-px flex-1 bg-surface-700/50 my-1.5" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <p className="text-sm text-slate-300 leading-snug truncate">
              {activity.description}
            </p>
            {activity.project && (
              <p className="text-xs text-slate-600 mt-0.5">{activity.project}</p>
            )}
          </div>
          <p className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0 mt-0.5">{timeAgo}</p>
        </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-surface-700 flex-shrink-0" />
      <div className="flex-1 pb-4 space-y-1.5">
        <div className="w-20 h-4 rounded-full bg-surface-700" />
        <div className="w-48 h-3 rounded bg-surface-700" />
        <div className="w-24 h-3 rounded bg-surface-700" />
      </div>
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-700 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 font-medium">No activity yet</p>
      <p className="text-xs text-slate-600 mt-1">
        Create tasks and projects to see activity here
      </p>
    </div>
  )
}

export default function RecentActivity({ activities, loading }) {
  const list = activities ?? []
  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : list.length === 0 ? 'No activity yet' : `${list.length} recent event${list.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <a
          href="/tasks"
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          View tasks →
        </a>
      </div>

      <div className="space-y-0">
        {loading
          ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
          : list.length === 0
            ? <EmptyActivity />
            : list.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  isLast={i === list.length - 1}
                />
              ))
        }
      </div>
    </div>
  )
}
