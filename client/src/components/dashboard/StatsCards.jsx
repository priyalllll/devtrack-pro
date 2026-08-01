// client/src/components/dashboard/StatsCards.jsx
// Real stats from DB — trend chips use computed values.
import clsx from 'clsx'

const CARD_META = [
  {
    key:    'totalProjects',
    label:  'Total Projects',
    color:  'from-indigo-500/20 to-indigo-600/5',
    ring:   'ring-indigo-500/30',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    key:    'activeTasks',
    label:  'Active Tasks',
    color:  'from-blue-500/20 to-blue-600/5',
    ring:   'ring-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key:    'completedTasks',
    label:  'Completed Tasks',
    color:  'from-green-500/20 to-green-600/5',
    ring:   'ring-green-500/30',
    iconBg: 'bg-green-500/20 text-green-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key:    'upcomingDeadlines',
    label:  'Upcoming Deadlines',
    color:  'from-amber-500/20 to-amber-600/5',
    ring:   'ring-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

// Build a human trend label based on real stat values
function getTrend(key, stats) {
  if (!stats) return { label: '—', up: true }
  const total = (stats.activeTasks ?? 0) + (stats.completedTasks ?? 0)

  switch (key) {
    case 'totalProjects':
      return {
        label: stats.totalProjects === 0 ? 'No projects yet' : `${stats.totalProjects} total`,
        up:    true,
      }
    case 'activeTasks':
      return {
        label: stats.activeTasks === 0 ? 'All clear!' : `${stats.activeTasks} in progress`,
        up:    true,
      }
    case 'completedTasks': {
      const rate = total > 0 ? Math.round((stats.completedTasks / total) * 100) : 0
      return {
        label: `${rate}% completion rate`,
        up:    rate >= 50,
      }
    }
    case 'upcomingDeadlines':
      return {
        label: stats.upcomingDeadlines === 0 ? 'No deadlines this week' : 'Next 7 days',
        up:    stats.upcomingDeadlines === 0,
      }
    default:
      return { label: '—', up: true }
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-700" />
        <div className="w-16 h-4 rounded bg-surface-700" />
      </div>
      <div className="w-12 h-7 rounded bg-surface-700 mb-1" />
      <div className="w-24 h-3 rounded bg-surface-700" />
    </div>
  )
}

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARD_META.map((c) => <SkeletonCard key={c.key} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARD_META.map((card) => {
        const { label, up } = getTrend(card.key, stats)
        return (
          <div
            key={card.key}
            className={clsx(
              'group relative overflow-hidden rounded-2xl p-5',
              'bg-surface-800/50 border border-surface-700/50',
              'hover:border-surface-600 hover:-translate-y-0.5',
              'transition-all duration-200 cursor-default',
              `ring-1 ${card.ring}`,
            )}
          >
            {/* Gradient overlay */}
            <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', card.color)} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', card.iconBg)}>
                  {card.icon}
                </div>
                <span className={clsx(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  up
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-amber-500/15 text-amber-400',
                )}>
                  {up ? '↑' : '⚠'}
                </span>
              </div>

              <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {stats?.[card.key] ?? '—'}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">{card.label}</p>
              <p className={clsx(
                'text-xs mt-2 font-medium',
                up ? 'text-green-400' : 'text-amber-400',
              )}>
                {label}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
