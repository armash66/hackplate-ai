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

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const [ov, ev, savedRes] = await Promise.all([
                getOverview(config),
                searchEvents({ food_only: true, per_page: 6 }, config),
                token ? api.get("/events/saved/list", config).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);
            setOverview(ov.data);
            setRecentEvents(ev.data);
            
            if (savedRes.data) {
                setSavedIds(new Set(savedRes.data.map(e => e.id)));
            }
        } catch (e) {
            console.error("Failed to load dashboard:", e);
        }
    }

    async function handleIngest() {
        setIngesting(true);
        try {
            const token = await getToken();
            const res = await triggerIngest(token, 10);
            alert(`Ingestion complete! ${res.data.new_events} new events found.`);
            loadData();
        } catch (e) {
            if (e.response && e.response.status === 401) {
                alert("Login required! Please log in first to run the scraper.");
            } else {
                alert("Ingestion failed. Is the backend running?");
            }
        }
        setIngesting(false);
    }

    async function toggleSaveEvent(eventId) {
        try {
            const token = await getToken();
            if (!token) {
                alert("Please log in to save events.");
                return;
            }
            
            const isSaved = savedIds.has(eventId);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (isSaved) {
                await api.delete(`/events/${eventId}/save`, config);
                setSavedIds(prev => {
                    const next = new Set(prev);
                    next.delete(eventId);
                    return next;
                });
            } else {
                await api.post(`/events/${eventId}/save`, {}, config);
                setSavedIds(prev => {
                    const next = new Set(prev);
                    next.add(eventId);
                    return next;
                });
            }
        } catch (err) {
            console.error("Save toggle failed", err);
        }
    }

    return (
        <div className="space-y-12">
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="mb-2">Opportunity Radar</h1>
                    <p className="text-[#9CA3AF] text-lg font-medium max-w-2xl">
                        AI-ranked tech events and local drops tailored to your discovery scope.
                    </p>
                </div>
                <button 
                    className="btn-premium btn-primary px-8" 
                    onClick={handleIngest} 
                    disabled={ingesting}
                >
                    {ingesting ? (
                        <><svg className="animate-spin h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Scanning...</>
                    ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Run Radar Scan</>
                    )}
                </button>
            </div>

            {/* STATS TILES */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="premium-card py-6 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold tracking-tighter mb-1 font-mono">{overview.total_events}</div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold">Total Signals</h3>
                    </div>
                    <div className="premium-card py-6 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold tracking-tighter mb-1 font-mono text-[#F59E0B]">{overview.food_events}</div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold">Food Drops</h3>
                    </div>
                    <div className="premium-card py-6 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold tracking-tighter mb-1 font-mono">{overview.total_sources}</div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold">Active Sources</h3>
                    </div>
                    <div className="premium-card py-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="text-2xl font-bold tracking-tight mb-1 truncate max-w-full px-2">{overview.top_city}</div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold">Peak Location</h3>
                    </div>
                </div>
            )}

            {/* MAIN FEED */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="m-0">Recent Matches</h2>
                    <div className="h-px flex-1 bg-[#1F2937]"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentEvents.length === 0 ? (
                        <div className="col-span-full py-20 premium-card flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">No active signals found</h3>
                            <p className="text-[#9CA3AF] max-w-sm mb-8">Adjust your radar scope in settings or run a fresh scan to populate your feed.</p>
                            <button className="btn-premium btn-primary" onClick={() => window.location.href='/settings'}>Adjust Radar Range</button>
                        </div>
                    ) : (
                        recentEvents.map((ev) => (
                            <div key={ev.id} className="premium-card group h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold leading-snug group-hover:text-[#6366F1] transition-colors">{ev.title}</h3>
                                    <button 
                                        onClick={() => toggleSaveEvent(ev.id)} 
                                        className={`transition-colors shrink-0 p-1 rounded-md hover:bg-[#1F2937] ${savedIds.has(ev.id) ? 'text-[#6366F1]' : 'text-[#4B5563] hover:text-[#F3F4F6]'}`}
                                    >
                                        <svg className="w-5 h-5" fill={savedIds.has(ev.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest bg-[#1F2937] px-2 py-0.5 rounded">
                                        {ev.city}
                                    </span>
                                </div>
                                
                                <p className="text-[#9CA3AF] text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                    {ev.description || "Synthesizing event opportunities..."}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {ev.food_score > 0 && (
                                        <div className="badge-premium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 flex items-center gap-1">
                                            <span>🍕</span> {Math.round(ev.food_likelihood * 100 || 80)}% Food
                                        </div>
                                    )}
                                    <div className="badge-premium bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 flex items-center gap-1">
                                        <span>⭐</span> {Math.round(ev.total_score || ev.relevance_score)} Score
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-[#1F2937] flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-wider text-[#4B5563] font-black">{ev.source}</span>
                                        <span className="text-[10px] text-[#6B7280]">{ev.created_at ? new Date(ev.created_at).toLocaleDateString() : 'Active Now'}</span>
                                    </div>
                                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="btn-premium btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                                        Explore <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
