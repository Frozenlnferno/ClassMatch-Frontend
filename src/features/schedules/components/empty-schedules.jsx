import { Plus } from "lucide-react"

export function EmptySchedules({ onCreateSchedule }) {
  return (
    <div className="cm-panel flex flex-col items-center justify-center border-dashed py-20 text-center">
      <div className="mb-4 rounded-full bg-blue-100 p-4">
        <svg
          className="size-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-900">No schedules yet</h2>
      <p className="mt-1 max-w-xs text-sm text-gray-600">
        Create your first schedule by uploading a PDF or entering your CRNs.
      </p>
      <button
        type="button"
        className="cm-btn cm-btn-md cm-btn-primary mt-6"
        onClick={onCreateSchedule}
      >
        <Plus className="size-4" />
        Create Schedule
      </button>
    </div>
  )
}
