import { useEffect, useState } from "react";
import {
  Banner,
  Button,
  Card,
  Field,
  Input,
  Modal,
  ProgressBar,
  Select,
} from "../../../components/ui.jsx";
import { PlusIcon } from "../../../components/icons.jsx";
import {
  TERM_OPTIONS,
  formatScheduleLabel,
  getYearOptions,
} from "../../../utils/classMatch.js";

export default function CreateScheduleModal({
  isOpen,
  onClose,
  onPdfSubmit,
  onCrnSubmit,
  fixedSchedule,
  isSubmitting,
  uploadProgress,
  uploadPhase,
}) {
  const [method, setMethod] = useState(fixedSchedule ? "crn" : "pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    year: fixedSchedule?.year || getYearOptions()[0],
    term: fixedSchedule?.term || "fall",
    courses: [{ subject: "", course: "", crn: "" }],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setMethod(fixedSchedule ? "crn" : "pdf");
    setSelectedFile(null);
    setForm({
      year: fixedSchedule?.year || getYearOptions()[0],
      term: fixedSchedule?.term || "fall",
      courses: [{ subject: "", course: "", crn: "" }],
    });
    setError("");
  }, [fixedSchedule, isOpen]);

  function updateCourse(index, field, value) {
    setForm((current) => ({
      ...current,
      courses: current.courses.map((course, courseIndex) =>
        courseIndex === index ? { ...course, [field]: value } : course,
      ),
    }));
  }

  function addRow() {
    setForm((current) => ({
      ...current,
      courses: [...current.courses, { subject: "", course: "", crn: "" }],
    }));
  }

  function removeRow(index) {
    setForm((current) => ({
      ...current,
      courses: current.courses.filter((_, courseIndex) => courseIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (method === "pdf") {
      if (!selectedFile) {
        setError("Choose a PDF file before uploading.");
        return;
      }
      try {
        await onPdfSubmit(selectedFile);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to upload schedule");
      }
      return;
    }

    const normalizedCourses = form.courses
      .map((course) => ({
        subject: course.subject.trim().toUpperCase(),
        course: course.course.trim(),
        crn: course.crn.trim(),
      }))
      .filter((course) => course.subject || course.course || course.crn);

    if (!normalizedCourses.length) {
      setError("Add at least one class before submitting.");
      return;
    }

    if (normalizedCourses.some((course) => !course.subject || !course.course || course.crn.length !== 5)) {
      setError("Each class needs a subject, course number, and 5-digit CRN.");
      return;
    }

    try {
      await onCrnSubmit({
        year: Number(form.year),
        term: form.term,
        courses: normalizedCourses,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to add classes");
    }
  }

  const phaseLabel = {
    idle: "Ready for upload",
    uploading: "Uploading PDF",
    parsing: "Parsing and matching classes",
    complete: "Finished",
  }[uploadPhase] || "Working";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={fixedSchedule ? `Add classes to ${formatScheduleLabel(fixedSchedule)}` : "Add a new schedule"}
      description={fixedSchedule ? "Use CRN entry to append classes to your existing schedule." : "Choose the fastest way to bring a schedule into ClassMatch."}
      actions={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="schedule-modal-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : method === "pdf" ? "Upload schedule" : "Save classes"}
          </Button>
        </>
      )}
    >
      <form id="schedule-modal-form" className="space-y-5" onSubmit={handleSubmit}>
        {!fixedSchedule ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMethod("pdf")}
              className={[
                "rounded-[24px] border p-5 text-left transition",
                method === "pdf" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200",
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-slate-900">PDF upload</div>
              <div className="mt-2 text-sm leading-6 text-slate-500">
                Best when you already have an exported schedule PDF ready from your school portal.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("crn")}
              className={[
                "rounded-[24px] border p-5 text-left transition",
                method === "crn" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200",
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-slate-900">CRN entry</div>
              <div className="mt-2 text-sm leading-6 text-slate-500">
                Build the schedule manually by year, term, subject, course number, and CRN.
              </div>
            </button>
          </div>
        ) : null}

        {error ? (
          <Banner title="Schedule issue" tone="danger">
            {error}
          </Banner>
        ) : null}

        {method === "pdf" ? (
          <div className="space-y-5">
            <Card className="rounded-[28px] bg-slate-50/80 p-5 shadow-none">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Export tips</div>
                <p className="text-sm leading-6 text-slate-600">
                  Export the schedule page from your registration portal as a PDF with selectable text. ClassMatch will parse the term and course identifiers from the document.
                </p>
              </div>
            </Card>

            <Field label="Schedule PDF">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              />
            </Field>

            {(uploadProgress > 0 || uploadPhase !== "idle") ? (
              <Card className="rounded-[28px] bg-slate-50/80 p-5 shadow-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">{phaseLabel}</div>
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {uploadPhase === "parsing" ? "Processing" : "In progress"}
                    </span>
                  </div>
                  <ProgressBar value={uploadPhase === "parsing" ? 100 : uploadProgress} label="Upload progress" />
                </div>
              </Card>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Year">
                <Select
                  value={form.year}
                  disabled={Boolean(fixedSchedule)}
                  onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
                >
                  {getYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Term">
                <Select
                  value={form.term}
                  disabled={Boolean(fixedSchedule)}
                  onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))}
                >
                  {TERM_OPTIONS.map((term) => (
                    <option key={term.value} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="space-y-3">
              {form.courses.map((course, index) => (
                <Card key={`${index}-${course.crn}`} className="rounded-[28px] bg-slate-50/80 p-5 shadow-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Class {index + 1}</div>
                      <div className="text-xs text-slate-500">Use the exact subject and CRN from your course catalog.</div>
                    </div>
                    {form.courses.length > 1 ? (
                      <button type="button" onClick={() => removeRow(index)} className="text-sm font-medium text-rose-600">
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Field label="Subject">
                      <Input value={course.subject} onChange={(event) => updateCourse(index, "subject", event.target.value)} placeholder="CS" />
                    </Field>
                    <Field label="Course number">
                      <Input value={course.course} onChange={(event) => updateCourse(index, "course", event.target.value)} placeholder="374" />
                    </Field>
                    <Field label="CRN">
                      <Input value={course.crn} onChange={(event) => updateCourse(index, "crn", event.target.value)} placeholder="12345" />
                    </Field>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="secondary" onClick={addRow}>
              <PlusIcon className="size-4" />
              Add another class
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}
