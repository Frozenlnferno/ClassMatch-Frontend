import { useState } from "react"
import { Upload, Hash, X, Plus, FileText, ArrowRight, MousePointerClick, Download } from "lucide-react"

export function CreateScheduleModal({
  open,
  onOpenChange,
  onCreateByPdf,
  onCreateByCrns,
}) {
  const [tab, setTab] = useState("pdf")
  const [term, setTerm] = useState("")
  const [year, setYear] = useState("")
  const [pdfFile, setPdfFile] = useState(null)
  const [crnInput, setCrnInput] = useState("")
  const [crns, setCrns] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + 2 - i)

  const resetForm = () => {
    setTerm("")
    setYear("")
    setPdfFile(null)
    setCrnInput("")
    setCrns([])
    setDragActive(false)
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

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        setPdfFile(file)
      }
    }
  }

  const canSubmitPdf = term && year && pdfFile
  const canSubmitCrn = term && year && crns.length > 0

  const handleSubmit = () => {
    if (tab === "pdf" && canSubmitPdf) {
      onCreateByPdf(term, parseInt(year, 10), pdfFile)
    } else if (tab === "crn" && canSubmitCrn) {
      onCreateByCrns(term, parseInt(year, 10), crns)
    }
    handleOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Create New Schedule</h2>
          <p className="text-sm text-gray-600">
            Upload a PDF export or enter CRNs to add your classes.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="term-select" className="text-xs font-medium text-gray-700">
              Term
            </label>
            <select
              id="term-select"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Select term</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-select" className="text-xs font-medium text-gray-700">
              Year
            </label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 flex rounded-md border border-gray-300 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setTab("pdf")}
            className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm ${
              tab === "pdf" ? "bg-white font-medium text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            <Upload className="size-4" />
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setTab("crn")}
            className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm ${
              tab === "crn" ? "bg-white font-medium text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            <Hash className="size-4" />
            Enter CRNs
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {tab === "pdf" ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">How to export your schedule as PDF</h4>
                <ol className="flex flex-col gap-3 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      1
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">Open your registration portal</span>
                      <span className="text-xs">Log in and navigate to your current schedule.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      2
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900">Click the detail view</span>
                        <MousePointerClick className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs">Switch to detailed/list view so all class info is visible.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      3
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900">Export as PDF</span>
                        <Download className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs">Use print (Ctrl+P/Cmd+P) and save as PDF.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      4
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900">Upload here</span>
                        <ArrowRight className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs">Drag and drop below, or browse files.</span>
                    </div>
                  </li>
                </ol>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 ${
                  dragActive ? "border-blue-500 bg-blue-50" : pdfFile ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-white"
                }`}
              >
                {pdfFile ? (
                  <div className="flex items-center gap-3">
                    <FileText className="size-8 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{pdfFile.name}</span>
                      <span className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPdfFile(null)
                      }}
                      aria-label="Remove file"
                      className="rounded-md border border-gray-300 p-1 hover:bg-gray-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 size-8 text-gray-500" />
                    <p className="mb-1 text-sm text-gray-600">Drag and drop your PDF here</p>
                    <p className="text-xs text-gray-500">or</p>
                    <label className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:underline">
                      Browse files
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setPdfFile(e.target.files[0])
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="crn-input" className="text-xs font-medium text-gray-700">
                  Enter CRNs
                </label>
                <p className="text-xs text-gray-500">
                  Type one CRN or paste multiple separated by commas, spaces, or semicolons.
                </p>
                <div className="flex gap-2">
                  <input
                    id="crn-input"
                    value={crnInput}
                    onChange={(e) => setCrnInput(e.target.value)}
                    onKeyDown={handleCrnKeyDown}
                    placeholder="e.g. 12345, 67890, 11223"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addMultipleCrns}
                    disabled={!crnInput.trim()}
                    aria-label="Add CRNs"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                      {crns.length} {crns.length === 1 ? "CRN" : "CRNs"} added
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
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-1 pr-1 font-mono text-xs text-blue-800"
                      >
                        {crn}
                        <button
                          type="button"
                          onClick={() => removeCrn(crn)}
                          className="ml-1 rounded-sm p-0.5 hover:bg-blue-100"
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
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={tab === "pdf" ? !canSubmitPdf : !canSubmitCrn}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 text-sm font-medium text-white transition hover:border-blue-700 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Schedule
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
