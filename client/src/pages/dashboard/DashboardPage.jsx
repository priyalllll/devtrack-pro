// client/src/pages/dashboard/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Main dashboard page — all data comes from real DB via useDashboard().
// ─────────────────────────────────────────────────────────────────────────────

import { useDashboard }      from '@hooks/useDashboard'
import WelcomeCard           from '@components/dashboard/WelcomeCard'
import StatsCards            from '@components/dashboard/StatsCards'
import ProductivityChart     from '@components/dashboard/ProductivityChart'
import RecentActivity        from '@components/dashboard/RecentActivity'
import TodaysTasks           from '@components/dashboard/TodaysTasks'
import UpcomingDeadlines     from '@components/dashboard/UpcomingDeadlines'
import QuickActions          from '@components/dashboard/QuickActions'

export default function DashboardPage() {
  const { data, loading } = useDashboard()

  const stats        = data.summary?.stats
  const productivity = data.summary?.productivity
  const chartData    = data.summary?.chartData
  const activities   = data.activities?.activities
  const todaysTasks  = data.todaysTasks?.tasks
  const deadlines    = data.deadlines?.deadlines

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome banner ── */}
      <WelcomeCard stats={stats} loading={loading.summary} />

      {/* ── Stat cards ── */}
      <StatsCards stats={stats} loading={loading.summary} />

      {/* ── Row: Chart + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductivityChart
            chartData={chartData}
            productivity={productivity}
            loading={loading.summary}
          />
        </div>
        <div className="xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* ── Row: Today's Tasks + Upcoming Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysTasks  tasks={todaysTasks} loading={loading.todaysTasks} />
        <UpcomingDeadlines deadlines={deadlines} loading={loading.deadlines} />
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity activities={activities} loading={loading.activities} />

    </div>
  )
}
