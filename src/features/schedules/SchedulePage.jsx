import { useCallback, useState } from "react"
import { SchedulesHeader } from "./components/schedules-header"
import { SchedulesToolbar } from "./components/schedules-toolbar"
import { EmptySchedules } from "./components/empty-schedules"
import { ClassList } from "./components/class-list"
import { CreateScheduleModal } from "./components/create-schedule-modal"
import { DeleteScheduleDialog } from "./components/delete-schedule-dialog"
import { AddClassModal } from "./components/add-class-modal"
import { INITIAL_SCHEDULES } from "./components/data"

export default function SchedulesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addClassModalOpen, setAddClassModalOpen] = useState(false)
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES)
  const [selectedScheduleId, setSelectedScheduleId] = useState(INITIAL_SCHEDULES[0]?.id ?? "")
  const [selectedClassIds, setSelectedClassIds] = useState(new Set())

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const scheduleName = currentSchedule ? `${currentSchedule.term} ${currentSchedule.year}` : ""

  const toggleSelectClass = useCallback((id) => {
    setSelectedClassIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (!currentSchedule) return
    setSelectedClassIds(new Set(currentSchedule.classes.map((c) => c.id)))
  }, [currentSchedule])

  const deselectAll = useCallback(() => {
    setSelectedClassIds(new Set())
  }, [])

  const changeSchedule = useCallback((id) => {
    setSelectedScheduleId(id)
    setSelectedClassIds(new Set())
  }, [])

  const deleteSelectedClasses = useCallback(() => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === selectedScheduleId
          ? {
              ...schedule,
              classes: schedule.classes.filter((classInfo) => !selectedClassIds.has(classInfo.id)),
            }
          : schedule
      )
    )
    setSelectedClassIds(new Set())
  }, [selectedScheduleId, selectedClassIds])

  const deleteSchedule = useCallback(() => {
    setSchedules((prev) => {
      const next = prev.filter((schedule) => schedule.id !== selectedScheduleId)
      setSelectedScheduleId(next[0]?.id ?? "")
      return next
    })
    setSelectedClassIds(new Set())
  }, [selectedScheduleId])

  const createSchedule = useCallback((term, year, classes) => {
    const newId = `s-${Date.now()}`
    const nextSchedule = { id: newId, term, year, classes }
    setSchedules((prev) => [nextSchedule, ...prev])
    setSelectedScheduleId(newId)
    setSelectedClassIds(new Set())
  }, [])

  const createByPdf = useCallback(
    (term, year, _file) => {
      createSchedule(term, year, [])
    },
    [createSchedule]
  )

  const createByCrns = useCallback(
    (term, year, crns) => {
      const classes = crns.map((crn, index) => ({
        id: `new-${Date.now()}-${index}`,
        title: `Class ${crn}`,
        category: "TBD",
        courseNumber: "---",
        section: "---",
        crn,
      }))
      createSchedule(term, year, classes)
    },
    [createSchedule]
  )

  const addClasses = useCallback(
    (crns) => {
      const classes = crns.map((crn, index) => ({
        id: `add-${Date.now()}-${index}`,
        title: `Class ${crn}`,
        category: "TBD",
        courseNumber: "---",
        section: "---",
        crn,
      }))
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === selectedScheduleId
            ? { ...schedule, classes: [...schedule.classes, ...classes] }
            : schedule
        )
      )
    },
    [selectedScheduleId]
  )

  const handleDeleteSchedule = () => {
    deleteSchedule()
    setDeleteDialogOpen(false)
  }

  return (
    <div className="min-h-screen">
      <SchedulesHeader onCreateSchedule={() => setCreateModalOpen(true)} />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {schedules.length === 0 ? (
          <EmptySchedules onCreateSchedule={() => setCreateModalOpen(true)} />
        ) : (
          <>
            <SchedulesToolbar
              schedules={schedules.map((s) => ({ id: s.id, term: s.term, year: s.year }))}
              selectedScheduleId={selectedScheduleId}
              onSelectSchedule={changeSchedule}
              onAddClasses={() => setAddClassModalOpen(true)}
              onDeleteSchedule={() => setDeleteDialogOpen(true)}
            />

            <hr className="my-6 border-gray-200" />

            {currentSchedule && (
              <ClassList
                classes={currentSchedule.classes}
                selectedClassIds={selectedClassIds}
                onToggleSelect={toggleSelectClass}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onDeleteSelected={deleteSelectedClasses}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateByPdf={createByPdf}
        onCreateByCrns={createByCrns}
      />

      {currentSchedule && (
        <>
          <DeleteScheduleDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            scheduleName={scheduleName}
            onConfirmDelete={handleDeleteSchedule}
          />
          <AddClassModal
            open={addClassModalOpen}
            onOpenChange={setAddClassModalOpen}
            onAddClasses={addClasses}
          />
        </>
      )}
    </div>
  )
}
