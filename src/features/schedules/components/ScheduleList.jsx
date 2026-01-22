import ScheduleCard from './ScheduleCard.jsx';

export default function ScheduleList({
    schedules,
    expandedSchedules,
    selectedCourses,
    onToggleExpansion,
    onCourseSelect,
    onBulkDelete,
    onDeleteSchedule
}) {
    if (schedules.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No schedules found.</p>
                <p className="text-sm text-gray-500">Click "Upload Schedule" to get started with your first schedule.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {schedules.map((scheduleData) => {
                const scheduleKey = `${scheduleData[1]}-${scheduleData[0]}`;
                const isExpanded = expandedSchedules.has(scheduleKey);

                return (
                    <ScheduleCard
                        key={scheduleKey}
                        scheduleData={scheduleData}
                        isExpanded={isExpanded}
                        selectedCourses={selectedCourses}
                        onToggleExpansion={onToggleExpansion}
                        onCourseSelect={onCourseSelect}
                        onBulkDelete={onBulkDelete}
                        onDeleteSchedule={onDeleteSchedule}
                    />
                );
            })}
        </div>
    );
}