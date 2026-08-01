// client/src/components/dashboard/WelcomeCard.jsx
import { useAuthStore } from '@store/authStore'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function WelcomeCard({ stats }) {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 text-white">
      {/* Decorative orbs */}
      <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-6 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-24 w-24 h-24 bg-primary-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-primary-200 text-sm font-medium mb-1">{formatDate()}</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="mt-1.5 text-primary-200 text-sm">
            You have{' '}
            <span className="font-semibold text-white">{stats?.activeTasks ?? '—'} active tasks</span>
            {' '}and{' '}
            <span className="font-semibold text-white">{stats?.upcomingDeadlines ?? '—'} upcoming deadlines</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:flex-shrink-0">
          <div className="text-center px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-2xl font-bold">{stats?.completedTasks ?? '—'}</p>
            <p className="text-xs text-primary-200 mt-0.5">Tasks done</p>
          </div>
          <div className="text-center px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-2xl font-bold">{stats?.totalProjects ?? '—'}</p>
            <p className="text-xs text-primary-200 mt-0.5">Projects</p>
          </div>
        </div>
      </div>
    </div>
  )
}
