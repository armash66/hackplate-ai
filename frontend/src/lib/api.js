import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("hackplate_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;

// --- Auth ---
export const register = (email, password) =>
    api.post("/auth/register", { email, password });

export const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("hackplate_token", res.data.access_token);
    return res.data;
};

export const getMe = () => api.get("/auth/me");

export const logout = () => localStorage.removeItem("hackplate_token");

// --- Events ---
export const searchEvents = (params) => api.get("/events/", { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const saveEvent = (id) => api.post(`/events/${id}/save`);
export const unsaveEvent = (id) => api.delete(`/events/${id}/save`);
export const getSavedEvents = () => api.get("/events/saved/list");

// --- Notifications ---
export const getRules = () => api.get("/notifications/rules");
export const createRule = (data) => api.post("/notifications/rules", data);
export const deleteRule = (id) => api.delete(`/notifications/rules/${id}`);

// --- Analytics ---
export const getOverview = () => api.get("/analytics/overview");
export const getTrends = () => api.get("/analytics/trends");

// --- Ingestion ---
export const triggerIngest = (limit = 10) =>
    api.post(`/ingest?limit=${limit}`);
