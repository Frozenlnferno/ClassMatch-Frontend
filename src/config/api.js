const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export const API_ROUTES = {
    groups: `${API_ORIGIN}/api/groups`,
    schedules: `${API_ORIGIN}/api/schedules`,
    users: `${API_ORIGIN}/api/users`,
};
