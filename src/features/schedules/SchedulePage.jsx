import { useEffect, useState } from "react";
import {
  addScheduleCourses,
  deleteCourses,
  deleteSchedule,
  getScheduleClasses,
  getScheduleList,
  uploadSchedulePdf,
} from "./scheduleService.js";
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  ProgressBar,
  Select,
} from "../../components/ui.jsx";
import { CopyIcon, PlusIcon, TrashIcon, UploadIcon } from "../../components/icons.jsx";
import {
  TERM_OPTIONS,
  formatCourseCode,
  formatScheduleLabel,
  formatTimeRange,
  getScheduleKey,
  getYearOptions,
  groupSchedulesByYear,
  normalizeCourse,
  parseScheduleKey,
} from "../../utils/classMatch.js";

function CourseCard({ course, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(course)}
      className={[
        "w-full rounded-[28px] border p-5 text-left transition",
        isSelected
          ? "border-blue-300 bg-blue-50/80 shadow-[0_20px_45px_-32px_rgba(37,99,235,0.6)]"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-slate-900">{course.title}</div>
          <div className="text-sm font-medium text-slate-500">{formatCourseCode(course)} - Section {course.section || "TBA"}</div>
        </div>
        <Badge tone={isSelected ? "blue" : "neutral"}>{course.crn || "No CRN"}</Badge>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Type</div>
          <div className="mt-1 font-medium text-slate-700">{course.courseType || "Not listed"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Instructor</div>
          <div className="mt-1 font-medium text-slate-700">{course.instructor || "Not listed"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</div>
          <div className="mt-1 font-medium text-slate-700">
            {[course.building, course.roomNumber].filter(Boolean).join(" ") || "Arranged"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Meeting</div>
          <div className="mt-1 font-medium text-slate-700">{formatTimeRange(course.startTime, course.endTime)}</div>
          <div className="text-xs text-slate-400">{course.daysOfWeek || "Days arranged"}</div>
        </div>
      </div>
    </button>
  );
}

function SchedulePicker({ schedules, selectedKey, onChange }) {
  const groups = groupSchedulesByYear(schedules);

  return (
    <Field label="Schedule">
      <Select value={selectedKey} onChange={(event) => onChange(event.target.value)}>
        {groups.map((group) => (
          <optgroup key={group.year} label={String(group.year)}>
            {group.items.map((schedule) => (
              <option key={getScheduleKey(schedule)} value={getScheduleKey(schedule)}>
                {formatScheduleLabel(schedule)} - {schedule.class_count} classes
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </Field>
  );
}

function CreateScheduleModal({
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
  }, [isOpen, fixedSchedule?.term, fixedSchedule?.year]);

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
                    <Badge tone="blue">{uploadPhase === "parsing" ? "Processing" : "In progress"}</Badge>
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

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedCrns, setSelectedCrns] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClassesModalOpen, setIsAddClassesModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSchedule = selectedKey ? parseScheduleKey(selectedKey) : null;
  const normalizedClasses = classes.map((course) => normalizeCourse(course));

  useEffect(() => {
    refreshSchedules();
  }, []);

  useEffect(() => {
    if (!selectedSchedule) {
      setClasses([]);
      setSelectedCrns([]);
      return;
    }

    let isActive = true;

    async function loadClasses() {
      try {
        setIsLoadingClasses(true);
        setError("");
        const response = await getScheduleClasses(selectedSchedule.term, selectedSchedule.year);
        if (!isActive) return;
        setClasses(response);
        setSelectedCrns([]);
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load classes");
      } finally {
        if (isActive) {
          setIsLoadingClasses(false);
        }
      }
    }

    loadClasses();

    return () => {
      isActive = false;
    };
  }, [selectedKey]);

  async function refreshSchedules(nextSelectedKey = null) {
    try {
      setIsLoadingSchedules(true);
      setError("");
      const response = await getScheduleList();
      setSchedules(response);

      const desiredKey = nextSelectedKey && response.some((schedule) => getScheduleKey(schedule) === nextSelectedKey)
        ? nextSelectedKey
        : selectedKey && response.some((schedule) => getScheduleKey(schedule) === selectedKey)
          ? selectedKey
          : response[0]
            ? getScheduleKey(response[0])
            : "";
      setSelectedKey(desiredKey);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load schedules");
    } finally {
      setIsLoadingSchedules(false);
    }
  }

  function toggleCourse(course) {
    setSelectedCrns((current) =>
      current.includes(course.crn)
        ? current.filter((crn) => crn !== course.crn)
        : [...current, course.crn],
    );
  }

  async function handlePdfSubmit(file) {
    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadPhase("uploading");
    setError("");
    setSuccess("");

    try {
      const response = await uploadSchedulePdf(file, {
        onProgress: setUploadProgress,
        onStatusChange: setUploadPhase,
      });

      setUploadPhase("complete");
      const nextKey = getScheduleKey({
        year: response.Year,
        term: response.Term,
      });

      await refreshSchedules(nextKey);
      setSuccess(`Uploaded ${formatScheduleLabel({ year: response.Year, term: response.Term })}.`);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCrnSubmit(payload) {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await addScheduleCourses(payload.term, payload.year, payload.courses);
      const nextKey = getScheduleKey({ year: payload.year, term: payload.term });
      await refreshSchedules(nextKey);
      setSuccess(`Saved classes for ${formatScheduleLabel(payload)}.`);
      setIsModalOpen(false);
      setIsAddClassesModalOpen(false);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setUploadPhase("idle");
    }
  }

  async function handleDeleteSelected() {
    if (!selectedSchedule || !selectedCrns.length) return;
    if (!window.confirm(`Delete ${selectedCrns.length} selected classes from this schedule?`)) return;

    try {
      setError("");
      await deleteCourses(selectedSchedule.term, selectedSchedule.year, selectedCrns);
      await refreshSchedules(selectedKey);
      setSuccess("Selected classes deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete selected classes");
    }
  }

  async function handleDeleteSchedule() {
    if (!selectedSchedule) return;
    if (!window.confirm(`Delete the entire ${formatScheduleLabel(selectedSchedule)} schedule?`)) return;

    try {
      setError("");
      await deleteSchedule(selectedSchedule.term, selectedSchedule.year);
      await refreshSchedules();
      setSuccess(`Deleted ${formatScheduleLabel(selectedSchedule)}.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete schedule");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedules"
        title="Manage your schedules"
        description="Choose a term, review the classes in that schedule, and add or remove courses without leaving the page."
        actions={(
          <>
            <Button variant="secondary" onClick={() => setIsAddClassesModalOpen(true)} disabled={!selectedSchedule}>
              <CopyIcon className="size-4" />
              Add classes by CRN
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="size-4" />
              Add new schedule
            </Button>
          </>
        )}
      />

      {error ? (
        <Banner title="Schedule issue" tone="danger">
          {error}
        </Banner>
      ) : null}
      {success ? (
        <Banner title="Saved" tone="success">
          {success}
        </Banner>
      ) : null}

      <Card className="space-y-5">
        {isLoadingSchedules ? (
          <LoadingState title="Loading schedules" description="Bringing in every term you've added so far." />
        ) : schedules.length ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-end">
              <SchedulePicker schedules={schedules} selectedKey={selectedKey} onChange={setSelectedKey} />
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button variant="ghost" onClick={() => setSelectedCrns([])} disabled={!selectedCrns.length}>
                  Clear selection
                </Button>
                <Button variant="secondary" onClick={handleDeleteSelected} disabled={!selectedCrns.length}>
                  <TrashIcon className="size-4" />
                  Delete selected
                </Button>
                <Button variant="danger" onClick={handleDeleteSchedule} disabled={!selectedSchedule}>
                  <TrashIcon className="size-4" />
                  Delete schedule
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge tone="blue">{selectedCrns.length} selected</Badge>
              {selectedSchedule ? <Badge tone="neutral">{formatScheduleLabel(selectedSchedule)}</Badge> : null}
            </div>

            {isLoadingClasses ? (
              <LoadingState title="Loading classes" description="Gathering the classes in this schedule." />
            ) : normalizedClasses.length ? (
              <div className="grid gap-4">
                {normalizedClasses.map((course) => (
                  <CourseCard
                    key={`${course.sectionId}-${course.crn}`}
                    course={course}
                    isSelected={selectedCrns.includes(course.crn)}
                    onToggle={toggleCourse}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="This schedule is empty"
                description="Add classes by CRN to start matching this term against your groups."
                action={(
                  <Button onClick={() => setIsAddClassesModalOpen(true)}>
                    <PlusIcon className="size-4" />
                    Add classes
                  </Button>
                )}
              />
            )}
          </>
        ) : (
          <EmptyState
            title="No schedules yet"
            description="Upload a PDF or build your first schedule with CRNs so ClassMatch can start finding shared courses."
            action={(
              <Button onClick={() => setIsModalOpen(true)}>
                <UploadIcon className="size-4" />
                Add your first schedule
              </Button>
            )}
          />
        )}
      </Card>

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUploadProgress(0);
          setUploadPhase("idle");
        }}
        onPdfSubmit={handlePdfSubmit}
        onCrnSubmit={handleCrnSubmit}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
        uploadPhase={uploadPhase}
      />

      <CreateScheduleModal
        isOpen={isAddClassesModalOpen}
        onClose={() => setIsAddClassesModalOpen(false)}
        onPdfSubmit={handlePdfSubmit}
        onCrnSubmit={handleCrnSubmit}
        fixedSchedule={selectedSchedule}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
        uploadPhase={uploadPhase}
      />
    </div>
  );
}
