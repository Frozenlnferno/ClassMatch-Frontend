import { requirePublicUrlEnv } from "./env.js";

const API_ORIGIN = requirePublicUrlEnv("VITE_API_BASE_URL");

export const API_ROUTES = {
    groups: `${API_ORIGIN}/api/groups`,
    schedules: `${API_ORIGIN}/api/schedules`,
    users: `${API_ORIGIN}/api/users`,
};
