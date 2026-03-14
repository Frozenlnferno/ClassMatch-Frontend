import { useCallback, useEffect, useState } from "react"
import { SchedulesHeader } from "./components/schedules-header"
import { SchedulesToolbar } from "./components/schedules-toolbar"
import { EmptySchedules } from "./components/empty-schedules"
import { ClassList } from "./components/class-list"
import { CreateScheduleModal } from "./components/create-schedule-modal"
import { DeleteScheduleDialog } from "./components/delete-schedule-dialog"
import { AddClassModal } from "./components/add-class-modal"
import {
  getScheduleList,
  getScheduleClasses,
  uploadSchedulePdf,
  deleteSchedule as deleteScheduleApi,
  deleteCourses,
} from "./service"
import logger from "../../utils/logger"

const TERM_ORDER = {
  winter: 0,
  spring: 1,
  summer: 2,
  fall: 3,
}

function compareSchedulesByRecency(left, right) {
  const yearDiff = Number(right.year) - Number(left.year)
  if (yearDiff !== 0) return yearDiff

  return (TERM_ORDER[right.term] ?? -1) - (TERM_ORDER[left.term] ?? -1)
}

export default function SchedulesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addClassModalOpen, setAddClassModalOpen] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const [classes, setClasses] = useState([])
  const [selectedClassIds, setSelectedClassIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Derive current schedule from the ID
  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const scheduleName = currentSchedule ? `${currentSchedule.term} ${currentSchedule.year}` : ""

  // Fetch schedule list on mount
  useEffect(() => {
    fetchSchedules()
  }, [])

  // Fetch classes whenever selected schedule changes
  useEffect(() => {
    if (currentSchedule) {
      fetchClasses(currentSchedule.term, currentSchedule.year)
    } else {
      setClasses([])
    }
  }, [currentSchedule?.id, currentSchedule?.term, currentSchedule?.year])

  const fetchSchedules = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await getScheduleList()
      // list = [{term, year, class_count}]
      const mapped = list.map((s) => ({
        id: `${s.term}-${s.year}`,
        term: s.term,
        year: s.year,
        classCount: s.class_count,
      }))
      const sortedSchedules = [...mapped].sort(compareSchedulesByRecency)

      setSchedules(sortedSchedules)
      setSelectedScheduleId((previousId) => {
        if (sortedSchedules.some((schedule) => schedule.id === previousId)) {
          return previousId
        }

        return sortedSchedules[0]?.id || ""
      })
    } catch (err) {
      logger.error("Failed to fetch schedules:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async (term, year) => {
    try {
      const data = await getScheduleClasses(term, year)
      setClasses(data)
    } catch (err) {
      logger.error("Failed to fetch classes:", err)
      setClasses([])
    }
  }

  const toggleSelectClass = useCallback((id) => {
    setSelectedClassIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedClassIds(new Set(classes.map((c) => c.section_id || c.id)))
  }, [classes])

  const deselectAll = useCallback(() => {
    setSelectedClassIds(new Set())
  }, [])

  const changeSchedule = useCallback((id) => {
    if (!schedules.some((schedule) => schedule.id === id)) return
    setSelectedScheduleId(id)
    setSelectedClassIds(new Set())
  }, [schedules])

  const deleteSelectedClasses = useCallback(async () => {
    if (!currentSchedule) return
    const crnsToDelete = classes
      .filter((c) => selectedClassIds.has(c.section_id || c.id))
      .map((c) => String(c.crn))
    if (crnsToDelete.length === 0) return
    try {
      await deleteCourses(currentSchedule.term, currentSchedule.year, crnsToDelete)
      await fetchClasses(currentSchedule.term, currentSchedule.year)
      // Update class count in schedules list
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedScheduleId
            ? { ...s, classCount: s.classCount - crnsToDelete.length }
            : s
        )
      )
      setSelectedClassIds(new Set())
    } catch (err) {
      logger.error("Failed to delete classes:", err)
      setError(err.message)
    }
  }, [currentSchedule, selectedScheduleId, classes, selectedClassIds])

  const handleDeleteSchedule = useCallback(async () => {
    if (!currentSchedule) return
    try {
      await deleteScheduleApi(currentSchedule.term, currentSchedule.year)
      setDeleteDialogOpen(false)
      await fetchSchedules()
      setSelectedClassIds(new Set())
    } catch (err) {
      logger.error("Failed to delete schedule:", err)
      setError(err.message)
    }
  }, [currentSchedule])

  const createByPdf = useCallback(async (_term, _year, file) => {
    try {
      setError(null)
      await uploadSchedulePdf(file)
      await fetchSchedules()
    } catch (err) {
      logger.error("PDF upload failed:", err)
      setError(err.message)
    }
  }, [])

  const createByCrns = useCallback((_term, _year, _crns) => {
    // CRN entry is UI-only — the backend doesn't have a CRN submission endpoint.
    // Kept for future implementation.
    setError("CRN entry is not yet supported by the server. Please use PDF upload.")
  }, [])

  const addClasses = useCallback((_crns) => {
    setError("Adding classes by CRN is not yet supported by the server.")
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SchedulesHeader onCreateSchedule={() => setCreateModalOpen(true)} />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

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

            <ClassList
              classes={classes}
              selectedClassIds={selectedClassIds}
              onToggleSelect={toggleSelectClass}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              onDeleteSelected={deleteSelectedClasses}
            />
          </>
        )}
      </main>

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
