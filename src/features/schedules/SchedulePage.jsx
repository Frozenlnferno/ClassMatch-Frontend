import { useEffect, useState } from 'react';
import { supabase } from '../../../supabase';
import logger from '../../utils/logger';

export default function SchedulePage() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [term, setTerm] = useState('fall');

    const terms = [
        { value: 'fall', label: 'Fall' },
        { value: 'winter', label: 'Winter' },
        { value: 'spring', label: 'Spring' },
        { value: 'summer', label: 'Summer' }
    ];

    const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setError('No active session');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/schedules/?year=${year}&term=${term}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch schedule: ${response.status}`);
            }

            const result = await response.json();
            setSchedule(result);
        } catch (err) {
            setError(err.message);
            console.error('Request failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        setUploadLoading(true);
        setUploadError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setUploadError('No active session');
                setUploadLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('pdf', selectedFile);

            const response = await fetch('http://localhost:5000/api/schedules/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload schedule: ${response.status}`);
            }

            const result = await response.json();
            setSelectedFile(null);
            // Refresh the schedule display
            fetchSchedule();
        } catch (err) {
            setUploadError(err.message);
            console.error('Upload failed:', err);
        } finally {
            setUploadLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [year, term]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Schedule</h1>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                            Term
                        </label>
                        <select
                            id="term"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {terms.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchSchedule}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Schedule PDF</h3>
                    <form onSubmit={handleFileUpload} className="flex gap-4">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                        />
                        <button
                            type="submit"
                            disabled={!selectedFile || uploadLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {uploadLoading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                    {uploadError && (
                        <p className="text-red-600 text-sm mt-2">{uploadError}</p>
                    )}
                </div>
            </div>

            {/* Schedule Display */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {terms.find(t => t.value === term)?.label} {year} Schedule
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading schedule...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-600">No schedule found for this term. Upload a PDF to get started.</p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid gap-4">
                            {schedule.map((course, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {course[4]} {course[5]} - {course[6]}
                                            </h3>
                                            <p className="text-gray-700 font-medium">{course[7]}</p>
                                            <p className="text-gray-600 text-sm">CRN: {course[3]}</p>
                                        </div>
                                        <div className="text-right text-sm text-gray-600">
                                            <p>{course[2]} {course[1]}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}