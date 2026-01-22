import { useEffect, useState } from 'react';
import { getAllSchedules, deleteCourses, deleteSchedule } from './service.js';
import logger from '../../utils/logger.js';
import { ScheduleUploadForm, ScheduleList } from './components';
import Modal from '../../components/Modal.jsx';

export default function SchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSchedules, setExpandedSchedules] = useState(new Set());
    const [selectedCourses, setSelectedCourses] = useState(new Map()); // scheduleKey -> Set of CRNs
    const [formModalVisible, setFormModalVisible] = useState(false);

    const loadSchedules = async () => {
        setFormModalVisible(false);
        try {
            setLoading(true);
            setError(null);
            const data = await getAllSchedules();
            setSchedules(data);
        } catch (err) {
            logger.error('Failed to load schedules:', err);
            setError('Failed to load schedules. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = (scheduleKey, crn) => {
        setSelectedCourses(prev => {
            const newMap = new Map(prev);
            const crns = newMap.get(scheduleKey) || new Set();
            const newCrns = new Set(crns);
            if (newCrns.has(crn)) {
                newCrns.delete(crn);
            } else {
                newCrns.add(crn);
            }
            if (newCrns.size === 0) {
                newMap.delete(scheduleKey);
            } else {
                newMap.set(scheduleKey, newCrns);
            }
            return newMap;
        });
    };

    const handleBulkDelete = async (year, term) => {
        const scheduleKey = `${year}-${term}`;
        const selectedCrns = selectedCourses.get(scheduleKey);

        if (!selectedCrns || selectedCrns.size === 0) return;

        if (!confirm(`Delete ${selectedCrns.size} selected course(s)?`)) return;

        try {
            await deleteCourses(Array.from(selectedCrns), year.toString(), term);
            setSelectedCourses(prev => {
                const newMap = new Map(prev);
                newMap.delete(scheduleKey);
                return newMap;
            });
            await loadSchedules();
            logger.info('Courses deleted successfully');
        } catch (err) {
            setError(err.message);
            logger.error('Failed to delete courses:', err);
        }
    };

    const handleDeleteSchedule = async (year, term) => {
        if (!confirm(`Delete entire ${term} ${year} schedule?`)) return;

        try {
            await deleteSchedule(year.toString(), term);
            // Clear expanded state and selected courses for this schedule
            const scheduleKey = `${year}-${term}`;
            setExpandedSchedules(prev => {
                const newSet = new Set(prev);
                newSet.delete(scheduleKey);
                return newSet;
            });
            setSelectedCourses(prev => {
                const newMap = new Map(prev);
                newMap.delete(scheduleKey);
                return newMap;
            });
            await loadSchedules();
            logger.info('Schedule deleted successfully');
        } catch (err) {
            setError(err.message);
            logger.error('Failed to delete schedule:', err);
        }
    };

    const toggleScheduleExpansion = (key) => {
        setExpandedSchedules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-gray-900">SCHEDULES</h1>
                <button
                    onClick={() => setFormModalVisible(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    Upload Schedule
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <Modal title="Upload Schedule" open={formModalVisible} onClose={() => setFormModalVisible(false)}>
                <ScheduleUploadForm onUploadSuccess={loadSchedules} />
            </Modal>

            {/* Schedules Display */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading schedules...</p>
                </div>
            ) : (
                <ScheduleList
                    schedules={schedules}
                    expandedSchedules={expandedSchedules}
                    selectedCourses={selectedCourses}
                    onToggleExpansion={toggleScheduleExpansion}
                    onCourseSelect={handleCourseSelect}
                    onBulkDelete={handleBulkDelete}
                    onDeleteSchedule={handleDeleteSchedule}
                />
            )}
        </div>
    );
}