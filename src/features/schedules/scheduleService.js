import { API_ROUTES } from "../../config/api.js";
import { getAccessToken } from "../../utils/authToken.js";

const API_BASE = API_ROUTES.schedules;

async function getToken() {
    return getAccessToken();
}

export async function getScheduleList() {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/list`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch schedules: ${res.status}`);
    return res.json();
}

export async function getScheduleClasses(term, year) {
    const token = await getToken();
    const params = new URLSearchParams({ term, year: String(year) });
    const res = await fetch(`${API_BASE}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch classes: ${res.status}`);
    return res.json();
}

export async function uploadSchedulePdf(file) {
    const token = await getToken();
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
    }
    return res.json();
}

/**
 * Add schedule courses manually by CRN payload
 * @param {string} term - term (fall, spring, summer)
 * @param {string|number} year - schedule year
 * @param {Array<object>} courses - course identifiers for backend resolution
 * @returns {Promise<object>} API response payload
 */
export async function addScheduleCourses(term, year, courses) {
    const token = await getToken();
    const params = new URLSearchParams({ term, year: String(year) });
    const res = await fetch(`${API_BASE}/courses?${params}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ courses }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Add courses failed: ${res.status}`);
    }
    return res.json();
}

export async function deleteSchedule(term, year) {
    const token = await getToken();
    const params = new URLSearchParams({ term, year: String(year) });
    const res = await fetch(`${API_BASE}?${params}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Delete failed: ${res.status}`);
    }
    return res.json();
}

export async function deleteCourses(term, year, crns) {
    const token = await getToken();
    const params = new URLSearchParams({ term, year: String(year) });
    const res = await fetch(`${API_BASE}/courses?${params}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ crns }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Delete courses failed: ${res.status}`);
    }
    return res.json();
}
