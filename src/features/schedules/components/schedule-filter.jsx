import { CalendarDays } from "lucide-react"

export function ScheduleFilter({
  schedules,
  selectedScheduleId,
  onSelectSchedule,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-600">
        <CalendarDays className="size-4" />
        <span className="text-sm font-medium">Schedule</span>
      </div>
      <select
        value={selectedScheduleId}
        onChange={(e) => onSelectSchedule(e.target.value)}
        aria-label="Select a schedule"
        className="cm-select w-64 text-gray-900"
      >
        {schedules.map((schedule) => (
          <option key={schedule.id} value={schedule.id}>
            {schedule.term} {schedule.year}
          </option>
        ))}
      </select>
    </div>
  )
}
