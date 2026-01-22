import { useState, useEffect } from 'react';
import { getSchedule } from '../service.js';
import logger from '../../../utils/logger.js';
import CourseItem from './CourseItem.jsx';

export default function ScheduleCard({
    scheduleData,
    isExpanded,
    selectedCourses,
    onToggleExpansion,
    onCourseSelect,
    onBulkDelete,
    onDeleteSchedule
}) {

    const term = scheduleData[0];
    const year = scheduleData[1];
    const courseCount = scheduleData[2];
    const scheduleKey = `${scheduleData[1]}-${scheduleData[0]}`;
    const [detailedCourses, setDetailedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [coursesError, setCoursesError] = useState(null);
    const selectedInSchedule = selectedCourses.get(scheduleKey) || new Set();

    // Load detailed courses when expanded (only if we don't already have them)
    useEffect(() => {
        if (isExpanded && detailedCourses.length === 0) {
            loadDetailedCourses();
        }
    }, [isExpanded]);

    const loadDetailedCourses = async () => {
        setLoadingCourses(true);
        setCoursesError(null);
        try {
            const courses = await getSchedule(year.toString(), term);
            setDetailedCourses(courses);
        } catch (err) {
            logger.error('Failed to load detailed courses:', err);
            setCoursesError('Failed to load course details');
        } finally {
            setLoadingCourses(false);
        }
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:bg-gray-900 cursor-pointer" 
            onClick={() => onToggleExpansion(scheduleKey)}
        >
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {term.charAt(0).toUpperCase() + term.slice(1).toLowerCase()} {year}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {courseCount} course{courseCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedInSchedule.size > 0 && (
                            <button
                                onClick={() => onBulkDelete(year, term)}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Selected ({selectedInSchedule.size})
                            </button>
                        )}
                        <button
                            onClick={() => onDeleteSchedule(year, term)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete All
                        </button>
                        <button
                            onClick={() => onToggleExpansion(scheduleKey)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6">
                    {loadingCourses ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading course details...</p>
                        </div>
                    ) : coursesError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">{coursesError}</p>
                            <button
                                onClick={loadDetailedCourses}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : detailedCourses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No courses found in this schedule.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {detailedCourses.map((course, index) => {
                                const crn = course[3];
                                const isSelected = selectedInSchedule.has(crn);

                                return (
                                    <CourseItem
                                        key={index}
                                        course={course}
                                        isSelected={isSelected}
                                        onToggleSelect={(crn) => onCourseSelect(scheduleKey, crn)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}