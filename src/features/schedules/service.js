import { supabase } from "../../../supabase.js";

/**
 * Upload a PDF schedule file
 * @param {File} pdfFile - The PDF file to upload
 * @returns {Promise<object>} Upload result with courses and schedule info
 */
export async function uploadSchedule(pdfFile) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const response = await fetch('http://localhost:5000/api/schedules/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload schedule: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get all schedules for the current user
 * @returns {Promise<Array>} List of schedules grouped by year-term
 */
export async function getAllSchedules() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    
    const response = await fetch('http://localhost:5000/api/schedules/list', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get schedule for a specific year and term
 * @param {string} year - The year
 * @param {string} term - The term
 * @returns {Promise<Array>} List of courses
 */
export async function getSchedule(year, term) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const params = new URLSearchParams({ year, term });
    const response = await fetch(`http://localhost:5000/api/schedules/?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
    }

    return await response.json();
}

/**
 * Delete courses from a schedule
 * @param {Array<string>} crns - Array of CRNs to delete
 * @param {string} year - The year
 * @param {string} term - The term
 * @returns {Promise<object>} Success response
 */
export async function deleteCourses(crns, year, term) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const params = new URLSearchParams({ year, term });
    const response = await fetch(`http://localhost:5000/api/schedules/courses?${params}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crns }),
    });

    if (!response.ok) {
        throw new Error(`Failed to delete courses: ${response.status}`);
    }

    return await response.json();
}

/**
 * Delete an entire schedule for a year-term
 * @param {string} year - The year
 * @param {string} term - The term
 * @returns {Promise<object>} Success response
 */
export async function deleteSchedule(year, term) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const params = new URLSearchParams({ year, term });
    const response = await fetch(`http://localhost:5000/api/schedules/?${params}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.status}`);
    }

    return await response.json();
}