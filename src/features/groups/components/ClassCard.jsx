import { useState } from "react"
import { Clock, MapPin, Users, History, User, BookOpen, X } from "lucide-react"

export function ClassCard({ classInfo, sharedMembers, pastMembers = [] }) {
  const [isOpen, setIsOpen] = useState(false)

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
        aria-label={`View details for ${classInfo.name}`}
      >
        <header className="mb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">
                {classInfo.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {classInfo.code}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {classInfo.credits} credits
            </span>
          </div>
        </header>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{classInfo.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{classInfo.location}</span>
          </div>
        </div>

        {sharedMembers.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-medium text-primary">
                {sharedMembers.length} group {sharedMembers.length === 1 ? "member" : "members"} in this class
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sharedMembers.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {sharedMembers.length > 3 && (
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                  +{sharedMembers.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {pastMembers.length > 0 && (
          <div className={`pt-3 ${sharedMembers.length > 0 ? "mt-3" : ""} border-t border-border`}>
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">
                {pastMembers.length} {pastMembers.length === 1 ? "member" : "members"} took this before
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pastMembers.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {pastMembers.length > 3 && (
                <span className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground text-xs font-medium">
                  +{pastMembers.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {sharedMembers.length === 0 && pastMembers.length === 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              No group members share this class
            </p>
          </div>
        )}
      </article>


      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-gray-300 rounded-lg max-w-lg bg-white w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-300 sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{classInfo.name}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{classInfo.code}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {classInfo.credits} credits
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span>{classInfo.schedule}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span>{classInfo.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span>{classInfo.instructor}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h4 className="text-sm font-medium">Currently Taking This Class</h4>
                  </div>
                  {sharedMembers.length > 0 ? (
                    <ul className="space-y-2" role="list">
                      {sharedMembers.map((member) => (
                        <li key={member.id} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-muted-foreground capitalize">({member.role})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No group members are currently in this class</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <h4 className="text-sm font-medium">Previously Took This Class</h4>
                  </div>
                  {pastMembers.length > 0 ? (
                    <ul className="space-y-2" role="list">
                      {pastMembers.map((member) => (
                        <li key={member.id} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm">{member.name}</span>
                          {member.semester && (
                            <span className="text-xs text-muted-foreground">({member.semester})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No group members have taken this class before</p>
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

