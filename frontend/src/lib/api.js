import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

export default api;

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
export const triggerIngest = (token, limit = 10) =>
    api.post(`/ingest?limit=${limit}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
