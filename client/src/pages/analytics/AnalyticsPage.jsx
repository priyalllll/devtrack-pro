// client/src/pages/analytics/AnalyticsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// DevTrack Pro — Analytics Dashboard
// Features: Recharts visualizations, real DB aggregation data, dark SaaS UI,
//           responsive layout, zero dummy data.
// ─────────────────────────────────────────────────────────────────────────────

import { useAnalytics } from '@hooks/useAnalytics'
import clsx from 'clsx'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// Custom tooltip for charts
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="text-slate-400 font-semibold mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name || entry.dataKey} className="flex items-center justify-between gap-4 my-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-300 capitalize">{entry.name || entry.dataKey}:</span>
          </div>
          <span className="font-bold text-white tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, value, subtext, icon, color, ring }) {
  return (
    <div className={clsx(
      'relative overflow-hidden rounded-2xl p-5 bg-surface-800/60 border border-surface-700/60',
      'hover:border-surface-600 transition-all duration-200 ring-1',
      ring,
    )}>
      <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none', color)} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-surface-700/50 text-white">
          {icon}
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5 animate-pulse min-h-[220px]">
      <div className="w-1/3 h-4 bg-surface-700 rounded mb-4" />
      <div className="w-full h-36 bg-surface-700/40 rounded-xl" />
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, loading, error } = useAnalytics()

  const summary = data?.summary
  const statusDistribution = data?.statusDistribution ?? []
  const priorityDistribution = data?.priorityDistribution ?? []
  const projectCompletion = data?.projectCompletion ?? []
  const weeklyTrend = data?.weeklyTrend ?? []
  const mostProductiveDays = data?.mostProductiveDays ?? []

  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface-800 border border-surface-700">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Productivity</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Real-time metrics, project completion rates, velocity trends, and distribution reports
        </p>
      </div>

      {/* ── Top Summary Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={loading ? '—' : (summary?.totalProjects ?? 0)}
          subtext="Active workspaces"
          color="from-indigo-500/20 to-indigo-600/5"
          ring="ring-indigo-500/20"
          icon={(
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          )}
        />
        <StatCard
          title="Total Tasks"
          value={loading ? '—' : (summary?.totalTasks ?? 0)}
          subtext={`${summary?.completedTasks ?? 0} completed`}
          color="from-blue-500/20 to-blue-600/5"
          ring="ring-blue-500/20"
          icon={(
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        />
        <StatCard
          title="Overall Completion Rate"
          value={loading ? '—' : `${summary?.completionRate ?? 0}%`}
          subtext="Task resolution ratio"
          color="from-green-500/20 to-green-600/5"
          ring="ring-green-500/20"
          icon={(
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        />
        <StatCard
          title="Most Productive Day"
          value={loading ? '—' : (summary?.topProductiveDay ?? 'N/A')}
          subtext="Peak task completion"
          color="from-amber-500/20 to-amber-600/5"
          ring="ring-amber-500/20"
          icon={(
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        />
      </div>

      {/* ── Row 1: Weekly Velocity & Status Distribution ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Weekly Task Velocity (2 cols) */}
        <div className="xl:col-span-2 rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Weekly Task Velocity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tasks Created vs Completed per week (Last 8 Weeks)</p>
          </div>

          {loading ? <CardSkeleton /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="created" name="Tasks Created" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="completed" name="Tasks Completed" stroke="#22c55e" strokeWidth={2} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution (1 col) */}
        <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Status Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tasks distributed by status</p>
          </div>

          {loading ? <CardSkeleton /> : (
            <div className="my-auto">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="label"
                  >
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Status legend list */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-surface-700/50 text-xs">
                {statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-1.5 rounded-lg bg-surface-900/40">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-slate-300 truncate">{item.label}</span>
                    </div>
                    <span className="font-semibold text-white ml-2 tabular-nums">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Priority Breakdown & Productive Days ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Priority Distribution */}
        <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Priority Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Task count categorized by priority level</p>
          </div>

          {loading ? <CardSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most Productive Days */}
        <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Most Productive Days</h3>
            <p className="text-xs text-slate-400 mt-0.5">Completed tasks density by day of week</p>
          </div>

          {loading ? <CardSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mostProductiveDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ── Row 3: Project Completion Rates ── */}
      <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">Project Progress & Completion Rate</h3>
          <p className="text-xs text-slate-400 mt-0.5">Completion percentage across active projects</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-10 bg-surface-700/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projectCompletion.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No active projects found.</div>
        ) : (
          <div className="space-y-4">
            {projectCompletion.map((proj) => (
              <div key={proj.id} className="p-3 rounded-xl bg-surface-900/40 border border-surface-800/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                    <span>{proj.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{proj.completed} / {proj.total} tasks completed</span>
                    <span className="font-bold text-white">{proj.completionRate}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${proj.completionRate}%`,
                      backgroundColor: proj.color || '#6366f1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
