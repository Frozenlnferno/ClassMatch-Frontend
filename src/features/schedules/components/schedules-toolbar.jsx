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
    <div className="cm-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <ScheduleFilter
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onSelectSchedule={onSelectSchedule}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cm-btn cm-btn-sm cm-btn-secondary"
          onClick={onAddClasses}
        >
          <BookPlus className="size-4" />
          Add Classes
        </button>
        <button
          type="button"
          onClick={onDeleteSchedule}
          className="cm-btn cm-btn-sm cm-btn-danger-outline"
        >
          <Trash2 className="size-4" />
          Delete Schedule
        </button>
      </div>
    </div>
  )
}
