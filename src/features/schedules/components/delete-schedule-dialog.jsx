export function DeleteScheduleDialog({
  open,
  onOpenChange,
  scheduleName,
  onConfirmDelete,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="cm-modal-overlay" aria-hidden="true" />
      <div className="cm-modal-wrap">
      <div className="cm-modal-panel w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Delete Schedule</h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{scheduleName}</strong>? This will permanently remove all classes in this schedule. This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="cm-btn cm-btn-md cm-btn-secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="cm-btn cm-btn-md cm-btn-danger"
          >
            Delete Schedule
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
