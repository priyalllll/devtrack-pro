// client/src/components/dashboard/QuickActions.jsx
import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  {
    id:      'qa-new-project',
    label:   'New Project',
    desc:    'Start a new project',
    to:      '/projects',
    color:   'from-primary-500/20 to-primary-600/5 border-primary-500/30 hover:border-primary-500/60',
    iconBg:  'bg-primary-500/20 text-primary-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id:      'qa-add-task',
    label:   'Add Task',
    desc:    'Create a quick task',
    to:      '/tasks',
    color:   'from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-500/60',
    iconBg:  'bg-blue-500/20 text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id:      'qa-kanban',
    label:   'Open Kanban',
    desc:    'View board view',
    to:      '/kanban',
    color:   'from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-500/60',
    iconBg:  'bg-purple-500/20 text-purple-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id:      'qa-analytics',
    label:   'View Reports',
    desc:    'Analytics & insights',
    to:      '/analytics',
    color:   'from-green-500/20 to-green-600/5 border-green-500/30 hover:border-green-500/60',
    iconBg:  'bg-green-500/20 text-green-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl bg-surface-800/50 border border-surface-700/50 p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Quick Actions</h3>
        <p className="text-sm text-slate-500 mt-0.5">Jump to common tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            id={action.id}
            onClick={() => navigate(action.to)}
            className={`group relative flex flex-col items-start gap-2 p-3.5 rounded-xl
                        bg-gradient-to-br border transition-all duration-200
                        hover:-translate-y-0.5 hover:shadow-lg active:scale-95
                        ${action.color}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.iconBg}
                            group-hover:scale-110 transition-transform duration-150`}>
              {action.icon}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-slate-500 leading-snug">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
