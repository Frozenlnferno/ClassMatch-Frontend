import { Plus } from "lucide-react"

export function SchedulesHeader({ onCreateSchedule }) {
  return (
    <header className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="cm-panel flex items-center justify-between px-4 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            My Schedules
          </h1>
          <p className="text-sm text-gray-600">
            Manage your class schedules and share them with your groups.
          </p>
        </div>
        <button
          type="button"
          className="cm-btn cm-btn-md cm-btn-primary"
          onClick={onCreateSchedule}
        >
          <Plus className="size-4" />
          New Schedule
        </button>
      </div>
    </header>
  )
}
