import { useState } from "react"
import { Clock, MapPin, Users, User, BookOpen, X } from "lucide-react"

export function ClassCard({ classInfo, sharedMembers }) {
  const [isOpen, setIsOpen] = useState(false)

  const className = classInfo.title || "Untitled Class"
  const classCode = [classInfo.subject, classInfo.number].filter(Boolean).join(" ")
  const classSection = classInfo.section ? `Section ${classInfo.section}` : null
  const classType = classInfo.course_type || "Class"
  const classSchedule = [classInfo.days_of_week, classInfo.start_time && classInfo.end_time
    ? `${classInfo.start_time} - ${classInfo.end_time}`
    : null]
    .filter(Boolean)
    .join(" ")
  const classLocation = [classInfo.building, classInfo.room_number].filter(Boolean).join(" ") || "TBA"

  return (
    <>
      <article 
        className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:border-l-3 hover:translate-x-1 hover:shadow-md transition-all cursor-pointer"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        aria-label={`View details for ${className}`}
      >
        <header className="mb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">
                {className}
              </h3>
              <p className="text-sm text-slate-600">
                {classCode}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
              {classType}
            </span>
          </div>
        </header>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{classSchedule || "Schedule TBA"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{classLocation}</span>
          </div>
        </div>

        {sharedMembers.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-600">
                {sharedMembers.length} group {sharedMembers.length === 1 ? "member" : "members"} in this class
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sharedMembers.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {sharedMembers.length > 3 && (
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium">
                  +{sharedMembers.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {sharedMembers.length === 0 && (
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              No group members share this class
            </p>
          </div>
        )}
      </article>


      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-lg max-w-lg bg-white w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-300 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">{className}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{classCode}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
                  {classType}
                </span>
              </div>

              {classSection && <p className="text-sm text-slate-600">{classSection}</p>}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
                  <span>{classSchedule || "Schedule TBA"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
                  <span>{classLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
                  <span>{classInfo.instructor || "Instructor TBA"}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <h4 className="text-sm font-medium">Currently Taking This Class</h4>
                  </div>
                  {sharedMembers.length > 0 ? (
                    <ul className="space-y-2" role="list">
                      {sharedMembers.map((member) => (
                        <li key={member.id} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-xs font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm">{member.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600">No group members are currently in this class</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

