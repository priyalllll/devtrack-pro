// client/src/components/projects/ProjectCard.jsx
import { format } from 'date-fns'
import clsx from 'clsx'

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  ARCHIVED:  { label: 'Archived',  cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
}

function MemberAvatars({ members = [] }) {
  return (
    <div className="flex -space-x-1.5">
      {members.slice(0, 4).map(({ user }) => (
        <div
          key={user.id}
          title={user.name}
          className="w-6 h-6 rounded-full border-2 border-surface-800 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{ background: '#6366f1' }}
        >
          {user.name?.[0]?.toUpperCase()}
        </div>
      ))}
      {members.length > 4 && (
        <div className="w-6 h-6 rounded-full border-2 border-surface-800 bg-surface-700
                        flex items-center justify-center text-slate-400 text-[10px] font-bold">
          +{members.length - 4}
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.ACTIVE

  return (
    <div
      className={clsx(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-surface-800/60 border border-surface-700/50',
        'hover:border-surface-600 hover:-translate-y-0.5 hover:shadow-lg',
        'transition-all duration-200',
      )}
    >
      {/* ── Color accent bar ── */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: project.color }} />

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">

        {/* Header row: icon + name + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Colored initial circle */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: project.color + '30', border: `1px solid ${project.color}50` }}
            >
              <span style={{ color: project.color }}>
                {project.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-white text-sm leading-snug truncate">
              {project.name}
            </h3>
          </div>

          {/* Status badge */}
          <span className={clsx('flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border', status.cls)}>
            {status.label}
          </span>
        </div>

        {/* Description */}
        {project.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic mb-4">No description</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {project._count?.tasks ?? 0} tasks
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project._count?.members ?? 0} members
          </span>
          {project.createdAt && (
            <span className="ml-auto">
              {format(new Date(project.createdAt), 'MMM d')}
            </span>
          )}
        </div>

        {/* Footer: avatars + actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-700/50 mt-auto">
          <MemberAvatars members={project.members ?? []} />

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              id={`project-edit-${project.id}`}
              onClick={(e) => { e.stopPropagation(); onEdit(project) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         bg-surface-700 text-slate-300 hover:bg-surface-600 hover:text-white
                         transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              id={`project-delete-${project.id}`}
              onClick={(e) => { e.stopPropagation(); onDelete(project) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300
                         transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
