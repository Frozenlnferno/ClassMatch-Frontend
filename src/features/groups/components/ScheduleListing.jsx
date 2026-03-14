import { Calendar } from "lucide-react"
import { ClassCard } from "./ClassCard"

export function ScheduleListing({
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  scheduleClasses,
  matchingClassmates,
  members,
}) {
  const getSharedMembers = (sectionId) => {
    return matchingClassmates
      .filter((mc) => String(mc.section_id) === String(sectionId))
      .map((mc) => {
        const member = members.find((m) => m.user_id === mc.member_id)
        return { id: mc.member_id, name: mc.member_name || member?.name || "Unknown" }
      })
  }

  return (
    <section className="flex flex-col h-full" aria-labelledby="schedule-heading">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h2 id="schedule-heading" className="text-xl font-semibold text-gray-900">
              Your Schedule
            </h2>
          </div>
          {schedules.length > 0 && (
            <select
              value={selectedScheduleId}
              onChange={(e) => onSelectSchedule(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.term} {s.year}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {scheduleClasses.length} {scheduleClasses.length === 1 ? "class" : "classes"}
        </p>
      </header>

      {schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No schedules uploaded</p>
          <p className="text-sm mt-1">Upload a schedule on the Schedules page first.</p>
        </div>
      ) : scheduleClasses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No classes found for this schedule.</p>
        </div>
      ) : (
        <div className="grid gap-4" role="list" aria-label="Class schedule">
          {scheduleClasses.map((classInfo) => (
            <ClassCard
              key={classInfo.section_id || classInfo.id}
              classInfo={classInfo}
              sharedMembers={getSharedMembers(classInfo.section_id || classInfo.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
