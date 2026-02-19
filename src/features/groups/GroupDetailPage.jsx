import { useState } from "react"
import { GroupMemberListing } from "./components/GroupMemberListing"
import { ScheduleListing } from "./components/ScheduleListing"
import { Navigate } from "react-router-dom";

const initialGroupData = {
  id: "1",
  name: "Computer Science 2026",
  description: "A study group for CS majors graduating in 2026. Share schedules, find study partners, and coordinate group projects.",
}

const initialMembers = [
  { id: "1", name: "Alex Chen", role: "owner", classes: ["cs301", "cs350", "math201"] },
  { id: "2", name: "Jordan Lee", role: "admin", classes: ["cs301", "cs320", "math201"] },
  { id: "3", name: "Taylor Kim", role: "member", classes: ["cs350", "cs320", "phys101"] },
  { id: "4", name: "Sam Rivera", role: "member", classes: ["cs301", "math201", "phys101"] },
  { id: "5", name: "Casey Morgan", role: "member", classes: ["cs350", "cs320"] },
]

const userSchedule = [
  {
    id: "cs301",
    name: "Data Structures",
    code: "CS 301",
    schedule: "Mon, Wed, Fri 9:00 AM - 10:15 AM",
    location: "Engineering Hall 204",
    instructor: "Dr. Sarah Williams",
    credits: 3,
  },
  {
    id: "cs350",
    name: "Algorithms",
    code: "CS 350",
    schedule: "Tue, Thu 1:00 PM - 2:30 PM",
    location: "Science Center 102",
    instructor: "Prof. Michael Zhang",
    credits: 4,
  },
  {
    id: "math201",
    name: "Linear Algebra",
    code: "MATH 201",
    schedule: "Mon, Wed 2:00 PM - 3:15 PM",
    location: "Math Building 301",
    instructor: "Dr. Emily Johnson",
    credits: 3,
  },
  {
    id: "cs320",
    name: "Database Systems",
    code: "CS 320",
    schedule: "Tue, Thu 10:00 AM - 11:30 AM",
    location: "Tech Center 405",
    instructor: "Prof. David Park",
    credits: 3,
  },
]

const pastClassMembers = {
  cs301: [
    { id: "p1", name: "Morgan Hayes", semester: "Fall 2025" },
    { id: "p2", name: "Riley Thompson", semester: "Fall 2025" },
  ],
  cs350: [
    { id: "p3", name: "Jamie Chen", semester: "Spring 2025" },
  ],
  math201: [
    { id: "p4", name: "Drew Martinez", semester: "Fall 2024" },
    { id: "p5", name: "Quinn Wilson", semester: "Fall 2024" },
    { id: "p6", name: "Avery Brooks", semester: "Spring 2025" },
  ],
  cs320: [],
}

export default function GroupDetailPage() {
  const [group, setGroup] = useState(initialGroupData)
  const [members, setMembers] = useState(initialMembers)
  const [hasLeft, setHasLeft] = useState(false)
  const currentUserRole = "owner"

  const handlePromote = (memberId) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId) {
          const newRole = member.role === "member" ? "admin" : "owner"
          return { ...member, role: newRole }
        }
        return member
      })
    )
  }

  const handleDemote = (memberId) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId && member.role === "admin") {
          return { ...member, role: "member" }
        }
        return member
      })
    )
  }

  const handleKick = (memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const handleEditDescription = (newDescription) => {
    setGroup((prev) => ({ ...prev, description: newDescription }))
  }

  const handleLeaveGroup = () => {
    setHasLeft(true)
  }

  if (hasLeft) {
    return (
        <Navigate to="/mygroups" replace />
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white border border-gray-300 rounded-xl p-6 sticky top-8 bg-white">
              <GroupMemberListing
                group={group}
                members={members}
                currentUserRole={currentUserRole}
                onPromote={handlePromote}
                onDemote={handleDemote}
                onKick={handleKick}
                onEditDescription={handleEditDescription}
                onLeaveGroup={handleLeaveGroup}
              />
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white border border-slate-200 border-gray-300 rounded-xl p-6 bg-white">
              <ScheduleListing schedule={userSchedule} members={members} pastClassMembers={pastClassMembers} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
