import { useState } from "react"
import { Users, Pencil, LogOut, Check, X } from "lucide-react"
import { GroupMemberCard } from "./GroupMemberCard"

export function GroupMemberListing({
  group,
  members,
  currentUserRole,
  onPromote,
  onDemote,
  onKick,
  onEditDescription,
  onLeaveGroup,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(group.description)

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 }
    return roleOrder[a.role] - roleOrder[b.role]
  })

  const canEdit = currentUserRole === "owner" || currentUserRole === "admin"

  const handleSaveDescription = () => {
    onEditDescription?.(editedDescription)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedDescription(group.description)
    setIsEditing(false)
  }

  return (
    <aside className="flex flex-col h-full" aria-label="Group information">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl font-semibold text-slate-900 text-balance">
            {group.name}
          </h1>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Edit group description"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveDescription}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
              >
                <X className="h-3 w-3 mr-1" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <p className="text-slate-600 text-sm leading-relaxed pr-8">
              {group.description}
            </p>
            {canEdit && (
              <button
                className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-gray-900"
                onClick={() => setIsEditing(true)}
                aria-label="Edit description"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
          <Users className="h-4 w-4" aria-hidden="true" />
          <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
        </div>
      </header>

      <section aria-labelledby="members-heading" className="flex-1">
        <h2 id="members-heading" className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3">
          Members
        </h2>
        <ul className="flex flex-col gap-2" role="list" aria-label="Group members">
          {sortedMembers.map((member) => (
            <li key={member.id}>
              <GroupMemberCard
                member={member}
                currentUserRole={currentUserRole}
                onPromote={onPromote}
                onDemote={onDemote}
                onKick={onKick}
              />
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-6 pt-4 border-t border-gray-200">
        <button
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
          onClick={onLeaveGroup}
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Leave Group
        </button>
      </footer>
    </aside>
  )
}
