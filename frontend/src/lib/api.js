import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

export default api;

// --- Events ---
export const searchEvents = (params, config = {}) => api.get("/events/", { params, ...config });
export const getEvent = (id, config = {}) => api.get(`/events/${id}`, config);
export const saveEvent = (id, config = {}) => api.post(`/events/${id}/save`, {}, config);
export const unsaveEvent = (id, config = {}) => api.delete(`/events/${id}/save`, config);
export const getSavedEvents = (config = {}) => api.get("/events/saved/list", config);

// --- Notifications ---
export const getRules = (config = {}) => api.get("/notifications/rules", config);
export const createRule = (data, config = {}) => api.post("/notifications/rules", data, config);
export const deleteRule = (id, config = {}) => api.delete(`/notifications/rules/${id}`, config);

// --- Analytics ---
export const getOverview = (config = {}) => api.get("/analytics/overview", config);
export const getTrends = (config = {}) => api.get("/analytics/trends", config);

// --- Ingestion ---
export const triggerIngest = (token, limit = 10) =>
    api.post(`/ingest?limit=${limit}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
