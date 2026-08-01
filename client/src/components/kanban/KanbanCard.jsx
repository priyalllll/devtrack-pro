// client/src/components/kanban/KanbanCard.jsx
import { Draggable } from '@hello-pangea/dnd'
import { format, isValid, isPast } from 'date-fns'
import clsx from 'clsx'

const PRIORITY_CONFIG = {
  NONE:   { label: 'None',   dot: 'bg-slate-400',  cls: 'badge-priority-none'   },
  LOW:    { label: 'Low',    dot: 'bg-green-400',  cls: 'badge-priority-low'    },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400',  cls: 'badge-priority-medium' },
  HIGH:   { label: 'High',   dot: 'bg-red-400',    cls: 'badge-priority-high'   },
  URGENT: { label: 'Urgent', dot: 'bg-red-600',    cls: 'badge-priority-urgent' },
}

export default function KanbanCard({ task, index, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.NONE
  const dueDate  = task.dueDate ? new Date(task.dueDate) : null
  const overdue  = dueDate && isValid(dueDate) && isPast(dueDate) && task.status !== 'DONE'

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            'group flex flex-col gap-2.5 p-3.5 rounded-xl border select-none',
            'bg-surface-800/80 border-surface-700/60',
            'hover:border-surface-500 hover:shadow-md',
            'transition-all duration-150',
            snapshot.isDragging && 'shadow-2xl ring-2 ring-primary-500 bg-surface-800 scale-[1.02] z-50',
            task.status === 'DONE' && 'opacity-75',
          )}
        >
          {/* Top row: Priority & Edit/Delete actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', priority.dot)} />
              {task.priority !== 'NONE' && (
                <span className={clsx('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', priority.cls)}>
                  {priority.label}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                id={`kanban-edit-${task.id}`}
                onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
                title="Edit task"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                id={`kanban-delete-${task.id}`}
                onClick={(e) => { e.stopPropagation(); onDelete(task) }}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete task"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className={clsx(
            'text-sm font-medium text-slate-100 leading-snug break-words',
            task.status === 'DONE' && 'line-through text-slate-400',
          )}>
            {task.title}
          </h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
              {task.description}
            </p>
          )}

          {/* Footer: Project label, Due date, Assignee avatar */}
          <div className="flex items-center justify-between pt-2 border-t border-surface-700/50 mt-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {/* Project label */}
              {task.project && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md truncate max-w-[120px]"
                  style={{
                    backgroundColor: (task.project.color || '#6366f1') + '18',
                    color:            task.project.color || '#6366f1',
                    border:          `1px solid ${(task.project.color || '#6366f1')}30`,
                  }}
                  title={task.project.name}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: task.project.color || '#6366f1' }} />
                  <span className="truncate">{task.project.name}</span>
                </span>
              )}

              {/* Due date */}
              {dueDate && isValid(dueDate) && (
                <span className={clsx(
                  'inline-flex items-center gap-1 text-[11px] font-medium',
                  overdue ? 'text-red-400 font-semibold' : 'text-slate-400',
                )}>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{format(dueDate, 'MMM d')}{overdue ? '!' : ''}</span>
                </span>
              )}
            </div>

            {/* Assignee avatar */}
            {task.assignee && (
              <div
                className="w-5 h-5 rounded-full bg-primary-500/80 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                title={task.assignee.name}
              >
                {task.assignee.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
