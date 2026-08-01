// client/src/components/projects/DeleteConfirmModal.jsx
export default function DeleteConfirmModal({ project, onConfirm, onCancel, isDeleting }) {
  if (!project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-surface-800 rounded-2xl shadow-modal
                      border border-surface-700 overflow-hidden animate-scale-in">

        {/* Warning icon header */}
        <div className="p-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-white mb-2">Delete Project</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">"{project.name}"</span>?
          </p>
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">
              ⚠️ This will permanently delete the project along with all its tasks, columns, comments, and labels. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-900/50 border-t border-surface-700">
          <button
            id="delete-confirm-cancel"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            id="delete-confirm-submit"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn-danger min-w-[120px]"
          >
            {isDeleting ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
