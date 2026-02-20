export function DeleteScheduleDialog({
  open,
  onOpenChange,
  scheduleName,
  onConfirmDelete,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-medium text-gray-900">Delete Schedule</h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{scheduleName}</strong>? This will permanently remove all classes in this schedule. This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-600 bg-rose-600 px-4 text-sm font-medium text-white transition hover:border-rose-700 hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Delete Schedule
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
