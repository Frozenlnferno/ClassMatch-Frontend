import { supabase } from "../../../supabase.js";

/**
 * Get current user's profile information
 * @returns {Promise<object>} User profile data
 */
export async function getUserProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    return await response.json();
}

/**
 * Update current user's profile information
 * @param {object} updates - Object containing name and/or bio
 * @param {string} updates.name - New name
 * @param {string} updates.bio - New bio
 * @returns {Promise<object>} Success response
 */
export async function updateUserProfile(updates) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
    }

    return await response.json();
}