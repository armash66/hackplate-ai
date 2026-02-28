"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { getOverview, searchEvents, triggerIngest } from "../lib/api";

export default function Home() {
    const { getToken } = useAuth();
    const [overview, setOverview] = useState(null);
    const [recentEvents, setRecentEvents] = useState([]);
    const [ingesting, setIngesting] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const [ov, ev, savedRes] = await Promise.all([
                getOverview(config),
                searchEvents({ food_only: true, per_page: 8 }, config),
                token ? api.get("/events/saved/list", config).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);
            setOverview(ov.data);
            setRecentEvents(ev.data);
            if (savedRes.data) setSavedIds(new Set(savedRes.data.map(e => e.id)));
        } catch (e) { console.error("Failed to load dashboard:", e); }
    }

    async function handleIngest() {
        setIngesting(true);
        try {
            const token = await getToken();
            const res = await triggerIngest(token, 10);
            alert(`Done — ${res.data.new_events} new events found.`);
            loadData();
        } catch (e) {
            alert(e.response?.status === 401 ? "Please sign in first." : "Scan failed. Is the backend running?");
        }
        setIngesting(false);
    }

    async function toggleSave(id) {
        try {
            const token = await getToken();
            if (!token) { alert("Please sign in to save events."); return; }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (savedIds.has(id)) {
                await api.delete(`/events/${id}/save`, config);
                setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await api.post(`/events/${id}/save`, {}, config);
                setSavedIds(prev => { const n = new Set(prev); n.add(id); return n; });
            }
        } catch (err) { console.error("Save failed", err); }
    }

    return (
        <div>
            {/* ── Hero ── */}
            <div className="mb-10">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h1 className="mb-1">Opportunity Radar</h1>
                        <p className="text-[15px] text-[#6B7280]">AI-ranked events near you, scored for relevance and food availability.</p>
                    </div>
                    <button className="btn btn-primary shrink-0" onClick={handleIngest} disabled={ingesting}>
                        {ingesting ? "Scanning…" : "Run scan"}
                    </button>
                </div>

                {/* Inline stats */}
                {overview && (
                    <div className="flex items-center gap-6 mt-5 text-[13px] text-[#6B7280]">
                        <span><strong className="text-[#111827] font-semibold">{overview.total_events}</strong> events</span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span><strong className="text-[#D97706] font-semibold">{overview.food_events}</strong> with food</span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span><strong className="text-[#111827] font-semibold">{overview.total_sources}</strong> sources</span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span>Top: <strong className="text-[#111827] font-semibold">{overview.top_city}</strong></span>
                    </div>
                )}
            </div>

            {/* ── Events List ── */}
            <section>
                <h2 className="mb-4">Recent matches</h2>

                {recentEvents.length === 0 ? (
                    <div className="surface rounded-lg py-16 flex flex-col items-center text-center">
                        <svg className="w-10 h-10 text-[#D1D5DB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-base font-semibold mb-1">No events yet</h3>
                        <p className="text-sm text-[#9CA3AF] max-w-xs mb-5">Run a scan or adjust your search settings to populate your feed.</p>
                        <button className="btn btn-primary" onClick={handleIngest}>Run your first scan</button>
                    </div>
                ) : (
                    <div className="surface rounded-lg divide-y divide-[#E5E7EB]">
                        {recentEvents.map((ev) => (
                            <div key={ev.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[#F9FAFB] transition-colors duration-150 group">
                                {/* Main content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[15px] font-semibold truncate group-hover:text-[#4F46E5] transition-colors">{ev.title}</h3>
                                    </div>

                                    <p className="text-sm text-[#6B7280] line-clamp-1 mb-2">{ev.description || "No description available."}</p>

                                    <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                                        <span>{ev.city}</span>
                                        <span>·</span>
                                        <span className="uppercase tracking-wide">{ev.source}</span>
                                        {ev.created_at && (
                                            <>
                                                <span>·</span>
                                                <span>{new Date(ev.created_at).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                    {ev.food_score > 0 && (
                                        <span className="badge badge-food">🍕 Food</span>
                                    )}
                                    <span className="badge badge-score">{Math.round(ev.total_score || ev.relevance_score)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                    <button
                                        onClick={() => toggleSave(ev.id)}
                                        className={`p-1 rounded transition-colors ${savedIds.has(ev.id) ? 'text-[#4F46E5]' : 'text-[#D1D5DB] hover:text-[#6B7280]'}`}
                                    >
                                        <svg className="w-4 h-4" fill={savedIds.has(ev.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </button>
                                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-[#D1D5DB] hover:text-[#6B7280] transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
