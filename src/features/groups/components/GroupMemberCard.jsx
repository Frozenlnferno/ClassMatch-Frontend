import { useState } from "react"
import { ChevronUp, ChevronDown, UserX, MoreHorizontal } from "lucide-react"

const roleStyles = {
  owner: "bg-blue-500 text-white border border-blue-600",
  admin: "bg-blue-300 text-white border border-blue-400",
  member: "bg-gray-100 text-muted-foreground border border-gray-200",
}

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

export function GroupMemberCard({
  member,
  currentUserRole,
  onPromote,
  onDemote,
  onKick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const canManage = currentUserRole === "owner" || (currentUserRole === "admin" && member.role === "member")
  const canPromote = currentUserRole === "owner" && member.role !== "owner"
  const canDemote = currentUserRole === "owner" && member.role === "admin"
  const canKick = canManage && member.role !== "owner"

  return (
    <article className="flex items-center justify-between p-3 rounded-lg border border-gray-300 hover:shadow-sm transition-all hover:border-blue-500 hover:border-l-3 hover:translate-x-1">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium"
          aria-hidden="true"
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-card-foreground">{member.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full w-fit ${roleStyles[member.role]}`}
            role="status"
            aria-label={`Role: ${roleLabels[member.role]}`}
          >
            {roleLabels[member.role]}
          </span>
        </div>
      </div>

      {canManage && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-8 w-8 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label={`Manage ${member.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {canPromote && (
                <button
                  onClick={() => {
                    onPromote(member.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center first:rounded-t-lg"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Promote to {member.role === "member" ? "Admin" : "Owner"}
                </button>
              )}
              {canDemote && (
                <button
                  onClick={() => {
                    onDemote(member.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Demote to Member
                </button>
              )}
              {canKick && (
                <button
                  onClick={() => {
                    onKick(member.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center last:rounded-b-lg"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from group
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
