import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  LoadingState,
  PageHeader,
} from "../../components/ui.jsx";
import { CopyIcon, PlusIcon, TrashIcon, UploadIcon } from "../../components/icons.jsx";
import {
  formatScheduleLabel,
  getScheduleKey,
  normalizeCourse,
  parseScheduleKey,
} from "../../utils/classMatch.js";
import CourseCard from "./components/CourseCard.jsx";
import SchedulePicker from "./components/SchedulePicker.jsx";
import CreateScheduleModal from "./components/CreateScheduleModal.jsx";

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
  const selectedKeyRef = useRef("");

  const selectedSchedule = useMemo(
    () => (selectedKey ? parseScheduleKey(selectedKey) : null),
    [selectedKey],
  );
  const normalizedClasses = useMemo(
    () => classes.map((course) => normalizeCourse(course)),
    [classes],
  );

  useEffect(() => {
    selectedKeyRef.current = selectedKey;
  }, [selectedKey]);

  const loadClassesForSchedule = useCallback(async (schedule) => {
    if (!schedule) {
      setClasses([]);
      setSelectedCrns([]);
      return;
    }

    try {
      setIsLoadingClasses(true);
      setError("");
      const response = await getScheduleClasses(schedule.term, schedule.year);
      setClasses(response);
      setSelectedCrns([]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load classes");
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  const loadSchedules = useCallback(async (nextSelectedKey = null) => {
    try {
      setIsLoadingSchedules(true);
      setError("");
      const response = await getScheduleList();
      setSchedules(response);

      const currentSelectedKey = selectedKeyRef.current;
      const desiredKey = nextSelectedKey && response.some((schedule) => getScheduleKey(schedule) === nextSelectedKey)
        ? nextSelectedKey
        : currentSelectedKey && response.some((schedule) => getScheduleKey(schedule) === currentSelectedKey)
          ? currentSelectedKey
          : response[0]
            ? getScheduleKey(response[0])
            : "";

      setSelectedKey(desiredKey);
      return desiredKey;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load schedules");
      return "";
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    loadClassesForSchedule(selectedSchedule);
  }, [loadClassesForSchedule, selectedSchedule]);

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

      const resolvedKey = await loadSchedules(nextKey);
      await loadClassesForSchedule(parseScheduleKey(resolvedKey || nextKey));
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
      const resolvedKey = await loadSchedules(nextKey);
      await loadClassesForSchedule(parseScheduleKey(resolvedKey || nextKey));
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
      await loadClassesForSchedule(selectedSchedule);
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
      const nextKey = await loadSchedules();
      await loadClassesForSchedule(nextKey ? parseScheduleKey(nextKey) : null);
      setSuccess(`Deleted ${formatScheduleLabel(selectedSchedule)}.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete schedule");
    }
  }

  return (
    <div className="motion-fade-up space-y-6">
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

      <Card className="motion-fade-up motion-delay-1 space-y-5">
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
