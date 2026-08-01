// client/src/components/kanban/KanbanColumn.jsx
import { Droppable } from '@hello-pangea/dnd'
import clsx from 'clsx'
import KanbanCard from './KanbanCard'

export default function KanbanColumn({ column, tasks, onEditTask, onDeleteTask, onQuickAdd }) {
  return (
    <div className="flex flex-col w-full min-w-[280px] max-w-sm rounded-2xl bg-surface-900/60 border border-surface-800/80 p-3.5 shadow-sm">

      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-800">
        <div className="flex items-center gap-2.5">
          {/* Accent dot/indicator */}
          <div className={clsx('w-3 h-3 rounded-full', column.dotBg)} />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            {column.title}
          </h3>
          {/* Count Badge */}
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', column.badgeCls)}>
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          id={`kanban-add-${column.id}`}
          onClick={() => onQuickAdd(column.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
          title={`Add task to ${column.title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              'flex-1 flex flex-col gap-3 min-h-[450px] p-1 rounded-xl transition-colors duration-150',
              snapshot.isDraggingOver && 'bg-surface-800/40 ring-2 ring-primary-500/30',
            )}
          >
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-center rounded-xl border border-dashed border-surface-800/80 bg-surface-900/20">
                <p className="text-xs text-slate-500 font-medium">No tasks</p>
                <button
                  onClick={() => onQuickAdd(column.id)}
                  className="mt-2 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  + Add card
                </button>
              </div>
            ) : (
              tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
