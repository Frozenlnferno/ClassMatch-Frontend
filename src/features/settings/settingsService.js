import { supabase } from "../../../supabase.js";
import { API_ROUTES } from "../../config/api.js";

const API_BASE = API_ROUTES.users;

async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    return session.access_token;
}

export async function getUserProfile() {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
    return res.json();
}

export async function updateUserProfile(updates) {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/me`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update profile: ${res.status}`);
    return res.json();
}

export async function getPublicProfile(userId) {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch user profile: ${res.status}`);
    return res.json();
}