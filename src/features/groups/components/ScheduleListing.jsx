import { Calendar } from "lucide-react"
import { ClassCard } from "./ClassCard"

export function ScheduleListing({ schedule, members, pastClassMembers = {} }) {
  const getSharedMembers = (classId) => {
    return members.filter(
      (member) => member.classes && member.classes.includes(classId)
    )
  }

  const getPastMembers = (classId) => {
    return pastClassMembers[classId] || []
  }

  return (
    <section className="flex flex-col h-full" aria-labelledby="schedule-heading">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h2 id="schedule-heading" className="text-xl font-semibold text-foreground">
            Your Schedule
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {schedule.length} {schedule.length === 1 ? "class" : "classes"} this semester
        </p>
      </header>

      <div className="grid gap-4" role="list" aria-label="Class schedule">
        {schedule.map((classInfo) => (
          <ClassCard
            key={classInfo.id}
            classInfo={classInfo}
            sharedMembers={getSharedMembers(classInfo.id)}
            pastMembers={getPastMembers(classInfo.id)}
          />
        ))}
      </div>
    </section>
  )
}
