// client/src/components/dashboard/ProductivityChart.jsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 shadow-modal text-sm">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-300 capitalize">{entry.dataKey}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="h-56 flex items-end gap-2 px-2 animate-pulse">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-surface-700"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  )
}

export default function ProductivityChart({ chartData, productivity, loading }) {
  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Productivity Trend</h3>
          <p className="text-sm text-slate-500 mt-0.5">Task completion over the last 7 days</p>
        </div>
        {productivity && (
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{productivity.percent}%</p>
            <p className="text-xs text-green-400 font-medium">
              ↑ {productivity.trend}% vs last week
            </p>
          </div>
        )}
      </div>

      {loading ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              formatter={(v) => <span className="text-slate-400 capitalize">{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradCompleted)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradCreated)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
