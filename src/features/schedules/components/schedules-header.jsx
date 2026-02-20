import { Plus } from "lucide-react"

export function SchedulesHeader({ onCreateSchedule }) {
  return (
    <header className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
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
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 text-sm font-medium text-white transition hover:border-blue-700 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={onCreateSchedule}
        >
          <Plus className="size-4" />
          New Schedule
        </button>
      </div>
    </header>
  )
}
