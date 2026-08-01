// client/src/components/dashboard/UpcomingDeadlines.jsx
import { differenceInDays, format } from 'date-fns'
import clsx from 'clsx'

function urgencyConfig(daysLeft) {
  if (daysLeft < 0)  return { ring: 'ring-red-500/60',    dot: 'bg-red-500',   label: 'text-red-400',   badge: 'Overdue'          }
  if (daysLeft === 0)return { ring: 'ring-red-500/40',    dot: 'bg-red-500',   label: 'text-red-400',   badge: 'Today!'           }
  if (daysLeft <= 2) return { ring: 'ring-orange-500/40', dot: 'bg-orange-500',label: 'text-orange-400',badge: `${daysLeft}d left`}
  if (daysLeft <= 7) return { ring: 'ring-amber-500/40',  dot: 'bg-amber-500', label: 'text-amber-400', badge: `${daysLeft}d left`}
  return               { ring: 'ring-slate-700',          dot: 'bg-slate-500', label: 'text-slate-500', badge: `${daysLeft}d left`}
}

function DeadlineRow({ item }) {
  const daysLeft = differenceInDays(new Date(item.dueDate), new Date())
  const cfg = urgencyConfig(daysLeft)

  return (
    <div className={clsx(
      'flex items-start gap-3 p-3 rounded-xl ring-1 transition-all duration-150',
      'hover:bg-surface-700/30',
      cfg.ring,
    )}>
      <div className={clsx('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', cfg.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{item.project}</p>
        {item.dueDate && (
          <p className="text-xs text-slate-500 mt-0.5">
            {format(new Date(item.dueDate), 'MMM d, yyyy')}
          </p>
        )}
      </div>
      <span className={clsx('text-xs font-semibold whitespace-nowrap flex-shrink-0 mt-0.5', cfg.label)}>
        {cfg.badge}
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl ring-1 ring-surface-700 animate-pulse">
      <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-surface-600 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-3/4 h-3 rounded bg-surface-700" />
        <div className="w-1/2 h-2.5 rounded bg-surface-700" />
      </div>
      <div className="w-12 h-3 rounded bg-surface-700 flex-shrink-0 mt-0.5" />
    </div>
  )
}

function EmptyDeadlines() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 font-medium">No upcoming deadlines</p>
      <p className="text-xs text-slate-600 mt-1">Tasks with due dates will appear here</p>
    </div>
  )
}

export default function UpcomingDeadlines({ deadlines, loading }) {
  const count = deadlines?.length ?? 0

  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Upcoming Deadlines</h3>
          {!loading && (
            <p className="text-sm text-slate-500 mt-0.5">
              {count > 0 ? `${count} task${count !== 1 ? 's' : ''} due soon` : 'Next 14 days'}
            </p>
          )}
        </div>
        <a
          href="/tasks"
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          View all →
        </a>
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)
          : count === 0
            ? <EmptyDeadlines />
            : deadlines.map((d) => <DeadlineRow key={d.id} item={d} />)
        }
      </div>
    </div>
  )
}
