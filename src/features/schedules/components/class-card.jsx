
import { BookOpen, Clock, MapPin, User } from "lucide-react"

function formatDays(days) {
  if (!days) return "";
  return days;
}

function formatTime(start, end) {
  if (!start || !end) return "TBA";
  return `${start} – ${end}`;
}

export function ClassCard({ classInfo, isSelected, onToggleSelect }) {
  const handleClick = () => {
    onToggleSelect(classInfo.section_id || classInfo.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onToggleSelect(classInfo.section_id || classInfo.id)
    }
  }

  const id = classInfo.section_id || classInfo.id;

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${classInfo.subject} ${classInfo.number} - ${classInfo.title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200"
      }`}
    >
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(id)}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="size-4 shrink-0 text-blue-600" />
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {classInfo.title}
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-medium text-blue-700">
            {classInfo.subject} {classInfo.number}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          {classInfo.section && (
            <span>Section <span className="font-medium text-gray-900">{classInfo.section}</span></span>
          )}
          <span>CRN <span className="font-mono font-medium text-gray-900">{classInfo.crn}</span></span>
          {classInfo.course_type && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">{classInfo.course_type}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-gray-500 mt-1">
          {classInfo.instructor && (
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 shrink-0" />
              <span>{classInfo.instructor}</span>
            </div>
          )}
          {(classInfo.start_time || classInfo.days_of_week) && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" />
              <span>
                {formatDays(classInfo.days_of_week)}
                {classInfo.days_of_week && classInfo.start_time ? " · " : ""}
                {formatTime(classInfo.start_time, classInfo.end_time)}
              </span>
            </div>
          )}
          {(classInfo.building || classInfo.room_number) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span>{[classInfo.building, classInfo.room_number].filter(Boolean).join(" ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
