import { ClassCard } from "./class-card"
import { Trash2, X } from "lucide-react"

export function ClassList({
  classes,
  selectedClassIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
}) {
  const allSelected = classes.length > 0 && selectedClassIds.size === classes.length
  const someSelected = selectedClassIds.size > 0

  return (
    <section aria-label="Class list">
      {/* Bulk actions bar */}
      <div className="cm-panel mb-4 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                if (allSelected || someSelected) {
                  onDeselectAll()
                } else {
                  onSelectAll()
                }
              }}
              aria-label={allSelected ? "Deselect all classes" : "Select all classes"}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {someSelected
                ? `${selectedClassIds.size} of ${classes.length} selected`
                : `${classes.length} ${classes.length === 1 ? "class" : "classes"}`}
            </span>
          </div>
        </div>

        {someSelected && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDeselectAll}
              className="cm-btn cm-btn-xs cm-btn-secondary"
            >
              <X className="size-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="cm-btn cm-btn-xs cm-btn-danger"
            >
              <Trash2 className="size-4" />
              Remove {selectedClassIds.size} {selectedClassIds.size === 1 ? "class" : "classes"}
            </button>
          </div>
        )}
      </div>

      {/* Class cards */}
      {classes.length > 0 ? (
        <div className="grid gap-3">
          {classes.map((classInfo) => (
            <ClassCard
              key={classInfo.id}
              classInfo={classInfo}
              isSelected={selectedClassIds.has(classInfo.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-gray-100 p-3">
            <svg
              className="size-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.471.89 6.068 2.352M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.471.89-6.068 2.352M12 6.042V20.352"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">No classes yet</p>
          <p className="mt-1 text-xs text-gray-600">
            Add classes to this schedule using the button above.
          </p>
        </div>
      )}
    </section>
  )
}
