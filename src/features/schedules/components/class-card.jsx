
import { BookOpen } from "lucide-react"

const BLOCK_TONES = [
  "border-indigo-200 bg-indigo-50 text-indigo-700",
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-teal-200 bg-teal-50 text-teal-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-rose-200 bg-rose-50 text-rose-700",
]

function getBlockTone(category = "") {
  let hash = 0
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash + category.charCodeAt(i)) % BLOCK_TONES.length
  }
  return BLOCK_TONES[hash]
}

export function ClassCard({ classInfo, isSelected, onToggleSelect }) {
  const handleClick = () => {
    onToggleSelect(classInfo.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onToggleSelect(classInfo.id)
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${classInfo.category} ${classInfo.courseNumber} - ${classInfo.title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200"
      }`}
    >
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(classInfo.id)}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="size-4 shrink-0 text-blue-600" />
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {classInfo.title}
            </h3>
          </div>
          <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium ${getBlockTone(classInfo.category)}`}>
            {classInfo.category} {classInfo.courseNumber}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>
            Section <span className="font-medium text-gray-900">{classInfo.section}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            CRN <span className="font-mono font-medium text-gray-900">{classInfo.crn}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
