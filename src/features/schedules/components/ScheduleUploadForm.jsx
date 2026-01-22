import { useState } from 'react';
import { uploadSchedule } from '../service.js';
import logger from '../../../utils/logger.js';

export default function ScheduleUploadForm({ onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        setUploadLoading(true);
        setUploadError(null);
        try {
            await uploadSchedule(selectedFile);
            setSelectedFile(null);
            // Reset the file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            onUploadSuccess();
            logger.info('Schedule uploaded successfully');
        } catch (err) {
            setUploadError(err.message);
            logger.error('Upload failed:', err);
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 text-center">Upload Your Schedule</h3>
            <form onSubmit={handleFileUpload} className="flex justify-center gap-4 h-full">
                <div className="w-full max-w-md">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!selectedFile || uploadLoading}
                    className="bg-blue-600 h-full text-white px-5 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={!selectedFile ? "Please select a PDF file first" : ""}
                >
                    {uploadLoading ? 'Uploading...' : 'Upload PDF'}
                </button>
            </form>
            {uploadError && (
                <p className="text-red-600 text-sm mt-4 text-center">{uploadError}</p>
            )}
        </div>
    );
}