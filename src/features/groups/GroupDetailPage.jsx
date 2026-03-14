import { useState, useEffect, useCallback } from "react"
import { useParams, Navigate } from "react-router-dom"
import { GroupMemberListing } from "./components/GroupMemberListing"
import { ScheduleListing } from "./components/ScheduleListing"
import {
  getUserGroups,
  getGroupMembers,
  leaveGroup,
  updateGroupInfo,
  kickMember,
  changeMemberRole,
  getMatchingClassmates,
} from "./service"
import { getScheduleList, getScheduleClasses } from "../schedules/service"
import { getPublicProfile } from "../settings/service"
import useSession from "../auth/useSession"
import logger from "../../utils/logger"
import Modal from "../../components/Modal"
import { Users, Calendar } from "lucide-react"

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const { session } = useSession()
  const currentUserId = session?.user?.id

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [currentUserRole, setCurrentUserRole] = useState("member")
  const [hasLeft, setHasLeft] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("members")

  // Schedule tab state
  const [schedules, setSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const [scheduleClasses, setScheduleClasses] = useState([])
  const [matchingClassmates, setMatchingClassmates] = useState([])

  // Member profile modal
  const [profileModal, setProfileModal] = useState({ open: false, user: null, loading: false })

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  useEffect(() => {
    if (activeTab === "schedule") {
      fetchSchedules()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedScheduleId && activeTab === "schedule") {
      const sched = schedules.find((s) => s.id === selectedScheduleId)
      if (sched) {
        fetchScheduleData(sched.term, sched.year)
      }
    }
  }, [selectedScheduleId, activeTab, schedules])

  useEffect(() => {
    const me = members.find((m) => m.user_id === currentUserId)
    setCurrentUserRole(me?.role || "member")
  }, [members, currentUserId])

  const fetchGroupData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [groupsData, membersData] = await Promise.all([
        getUserGroups(),
        getGroupMembers(groupId),
      ])
      const thisGroup = groupsData.find((g) => String(g.id) === String(groupId))
      if (!thisGroup) {
        setError("Group not found")
        setLoading(false)
        return
      }
      setGroup(thisGroup)
      setMembers(membersData)
    } catch (err) {
      logger.error("Failed to load group:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const list = await getScheduleList()
      const mapped = list.map((s) => ({
        id: `${s.term}-${s.year}`,
        term: s.term,
        year: s.year,
      }))
      setSchedules(mapped)
      if (mapped.length > 0 && !selectedScheduleId) {
        setSelectedScheduleId(mapped[0].id)
      }
    } catch (err) {
      logger.error("Failed to fetch schedules:", err)
    }
  }

  const fetchScheduleData = async (term, year) => {
    try {
      const [classes, classmates] = await Promise.all([
        getScheduleClasses(term, year),
        getMatchingClassmates(groupId, year, term),
      ])
      setScheduleClasses(classes)
      setMatchingClassmates(classmates)
    } catch (err) {
      logger.error("Failed to fetch schedule data:", err)
      setScheduleClasses([])
      setMatchingClassmates([])
    }
  }

  const handlePromote = useCallback(async (memberId) => {
    const member = members.find((m) => m.user_id === memberId)
    if (!member) return
    const newRole = member.role === "member" ? "admin" : "owner"
    try {
      await changeMemberRole(groupId, memberId, newRole)
      await fetchGroupData()
    } catch (err) {
      logger.error("Promote failed:", err)
      setError(err.message)
    }
  }, [groupId, members])

  const handleDemote = useCallback(async (memberId) => {
    try {
      await changeMemberRole(groupId, memberId, "member")
      await fetchGroupData()
    } catch (err) {
      logger.error("Demote failed:", err)
      setError(err.message)
    }
  }, [groupId])

  const handleKick = useCallback(async (memberId) => {
    try {
      await kickMember(groupId, memberId)
      setMembers((prev) => prev.filter((m) => m.user_id !== memberId))
    } catch (err) {
      logger.error("Kick failed:", err)
      setError(err.message)
    }
  }, [groupId])

  const handleEditDescription = useCallback(async (newDescription) => {
    try {
      await updateGroupInfo(groupId, { description: newDescription })
      setGroup((prev) => ({ ...prev, description: newDescription }))
    } catch (err) {
      logger.error("Edit failed:", err)
      setError(err.message)
    }
  }, [groupId])

  const handleLeaveGroup = useCallback(async () => {
    try {
      await leaveGroup(groupId)
      setHasLeft(true)
    } catch (err) {
      logger.error("Leave failed:", err)
      setError(err.message)
    }
  }, [groupId])

  const handleMemberClick = useCallback(async (memberId) => {
    setProfileModal({ open: true, user: null, loading: true })
    try {
      const profile = await getPublicProfile(memberId)
      setProfileModal({ open: true, user: profile, loading: false })
    } catch (err) {
      logger.error("Failed to fetch profile:", err)
      setProfileModal({ open: false, user: null, loading: false })
    }
  }, [])

  if (hasLeft) return <Navigate to="/mygroups" replace />

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error && !group) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Group Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{group?.name}</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === "members"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Members
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === "schedule"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "members" ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <GroupMemberListing
              group={group}
              members={members}
              currentUserRole={currentUserRole}
              onPromote={handlePromote}
              onDemote={handleDemote}
              onKick={handleKick}
              onEditDescription={handleEditDescription}
              onLeaveGroup={handleLeaveGroup}
              onMemberClick={handleMemberClick}
            />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <ScheduleListing
              schedules={schedules}
              selectedScheduleId={selectedScheduleId}
              onSelectSchedule={setSelectedScheduleId}
              scheduleClasses={scheduleClasses}
              matchingClassmates={matchingClassmates}
              members={members}
            />
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      <Modal
        open={profileModal.open}
        onClose={() => setProfileModal({ open: false, user: null, loading: false })}
        title="Member Profile"
      >
        {profileModal.loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 w-16 rounded-full bg-gray-200 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-24 mx-auto" />
          </div>
        ) : profileModal.user ? (
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold mb-3">
              {profileModal.user.name
                ? profileModal.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                : "?"}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {profileModal.user.name || "Unknown"}
            </h3>
            {profileModal.user.created_at && (
              <p className="text-sm text-gray-500 mt-1">
                Joined {new Date(profileModal.user.created_at).toLocaleDateString()}
              </p>
            )}
            {profileModal.user.bio && (
              <p className="text-sm text-gray-600 mt-3 max-w-xs">{profileModal.user.bio}</p>
            )}
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
