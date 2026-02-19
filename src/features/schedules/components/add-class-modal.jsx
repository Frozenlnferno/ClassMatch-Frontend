import { useState } from "react"
import { Plus, X } from "lucide-react"

export function AddClassModal({ open, onOpenChange, onAddClasses }) {
  const [crnInput, setCrnInput] = useState("")
  const [crns, setCrns] = useState([])

  const resetForm = () => {
    setCrnInput("")
    setCrns([])
  }

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const addMultipleCrns = () => {
    const parts = crnInput
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const unique = parts.filter((p) => !crns.includes(p))
    if (unique.length > 0) {
      setCrns((prev) => [...prev, ...unique])
      setCrnInput("")
    }
  }

  const removeCrn = (crn) => {
    setCrns((prev) => prev.filter((c) => c !== crn))
  }

  const handleCrnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addMultipleCrns()
    }
  }

  const handleSubmit = () => {
    if (crns.length > 0) {
      onAddClasses(crns)
      handleOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="cm-modal-overlay" aria-hidden="true" />
      <div className="cm-modal-wrap">
      <div className="cm-modal-panel w-full max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Add Classes</h2>
          <p className="text-sm text-gray-600">
            Enter one or more CRNs to add classes to this schedule.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-crn-input" className="cm-label">
              CRNs
            </label>
            <p className="text-xs text-gray-500">
              Separate multiple CRNs with commas, spaces, or semicolons.
            </p>
            <div className="flex gap-2">
              <input
                id="add-crn-input"
                value={crnInput}
                onChange={(e) => setCrnInput(e.target.value)}
                onKeyDown={handleCrnKeyDown}
                placeholder="e.g. 12345, 67890"
                className="cm-input font-mono"
              />
              <button
                type="button"
                onClick={addMultipleCrns}
                disabled={!crnInput.trim()}
                aria-label="Add CRNs"
                className="cm-btn cm-btn-sm cm-btn-secondary"
              >
                <Plus className="size-4" />
                Add
              </button>
            </div>
          </div>

          {crns.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {crns.length} {crns.length === 1 ? "CRN" : "CRNs"} staged
                </span>
                <button
                  type="button"
                  onClick={() => setCrns([])}
                  className="h-6 rounded px-2 text-xs text-gray-600 hover:bg-gray-100"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {crns.map((crn) => (
                  <span
                    key={crn}
                    className="cm-chip px-2 py-1 pr-1 font-mono text-xs"
                  >
                    {crn}
                    <button
                      type="button"
                      onClick={() => removeCrn(crn)}
                      className="ml-1 rounded-sm p-0.5 transition-colors hover:bg-blue-100"
                      aria-label={`Remove CRN ${crn}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="cm-btn cm-btn-md cm-btn-secondary"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cm-btn cm-btn-md cm-btn-primary"
            onClick={handleSubmit}
            disabled={crns.length === 0}
          >
            Add {crns.length > 0 ? `${crns.length} ${crns.length === 1 ? "Class" : "Classes"}` : "Classes"}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
