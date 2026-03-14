import { ScheduleFilter } from "./schedule-filter"
import { BookPlus, Trash2 } from "lucide-react"

export function SchedulesToolbar({
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  onAddClasses,
  onDeleteSchedule,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <ScheduleFilter
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onSelectSchedule={onSelectSchedule}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={onAddClasses}
        >
          <BookPlus className="size-4" />
          Add Classes
        </button>
        <button
          type="button"
          onClick={onDeleteSchedule}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-600 bg-rose-600 px-3 text-sm font-medium text-white transition hover:border-rose-800 hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <Trash2 className="size-4" />
          Delete Schedule
        </button>
      </div>
    </div>
  )
}
