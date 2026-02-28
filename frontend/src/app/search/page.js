"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { searchEvents, saveEvent, unsaveEvent, getSavedEvents } from "../../lib/api";

export default function SearchPage() {
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState({
        location: "", radius_km: 50, min_score: 0,
        source: "", event_type: "", food_only: false,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());
    const { getToken } = useAuth();

    useEffect(() => {
        setMounted(true);
        loadSavedEvents();
    }, []);

    async function loadSavedEvents() {
        try {
            const token = await getToken();
            if (token) {
                const res = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
                setSavedIds(new Set(res.data.map(e => e.id)));
            }
        } catch (e) {
            console.error("Failed to load saved events:", e);
        }
    }

    if (!mounted) return null;

    async function handleSearch() {
        setLoading(true);
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const params = {};
            if (filters.location) params.location = filters.location;
            if (filters.radius_km) params.radius_km = filters.radius_km;
            if (filters.min_score) params.min_score = filters.min_score;
            if (filters.source) params.source = filters.source;
            if (filters.event_type) params.event_type = filters.event_type;
            if (filters.food_only) params.food_only = true;
            
            const res = await searchEvents(params, config);
            setResults(res.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
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
                await unsaveEvent(eventId, config);
                setSavedIds(prev => {
                    const next = new Set(prev);
                    next.delete(eventId);
                    return next;
                });
            } else {
                await saveEvent(eventId, config);
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
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Opportunity Radar</h1>
                <p className="text-[#9CA3AF] mt-1 text-sm font-medium">Filter and isolate specific high-value events.</p>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 items-end">
                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Location</label>
                        <input className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl px-4 py-2.5 text-[#F3F4F6] text-sm focus:outline-none focus:border-[#6366F1] transition-colors placeholder-[#4B5563]" placeholder="e.g. Mumbai" value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Radius (km)</label>
                        <input className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl px-4 py-2.5 text-[#F3F4F6] text-sm focus:outline-none focus:border-[#6366F1] transition-colors" type="number" value={filters.radius_km}
                            onChange={(e) => setFilters({ ...filters, radius_km: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Min Score</label>
                        <input className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl px-4 py-2.5 text-[#F3F4F6] text-sm focus:outline-none focus:border-[#6366F1] transition-colors" type="number" value={filters.min_score}
                            onChange={(e) => setFilters({ ...filters, min_score: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Source</label>
                        <select className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl px-4 py-2.5 text-[#F3F4F6] text-sm focus:outline-none focus:border-[#6366F1] transition-colors appearance-none" value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                            <option value="">All Networks</option>
                            <option value="devfolio">Devfolio</option>
                            <option value="unstop">Unstop</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Type</label>
                        <select className="bg-[#0B0F1A] border border-[#1F2937] rounded-xl px-4 py-2.5 text-[#F3F4F6] text-sm focus:outline-none focus:border-[#6366F1] transition-colors appearance-none" value={filters.event_type}
                            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}>
                            <option value="">Any Format</option>
                            <option value="Online">Online</option>
                            <option value="Offline">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#1F2937]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${filters.food_only ? 'bg-[#F59E0B] border-[#F59E0B]' : 'bg-[#0B0F1A] border border-[#1F2937] group-hover:border-[#6366F1]'}`}>
                            {filters.food_only && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={filters.food_only} onChange={(e) => setFilters({ ...filters, food_only: e.target.checked })} />
                        <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors">Require Food Provision</span>
                    </label>

                    <button 
                        className="bg-[#111827] hover:bg-[#1F2937] text-[#F3F4F6] font-medium py-2 px-6 rounded-full border border-[#1F2937] transition-all flex items-center gap-2 text-sm shadow-sm" 
                        onClick={handleSearch} 
                        disabled={loading}
                    >
                        {loading ? 'Scanning...' : 'Execute Radar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((ev) => (
                    <div key={ev.id} className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-in-out flex flex-col h-full group relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366F1]/20 to-transparent left-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[17px] font-bold text-[#F3F4F6] leading-tight pr-4 group-hover:text-[#6366F1] transition-colors">{ev.title}</h3>
                            <button 
                                onClick={() => toggleSaveEvent(ev.id)} 
                                className={`${savedIds.has(ev.id) ? 'text-[#6366F1]' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'} cursor-pointer transition-colors shrink-0`}
                                title={savedIds.has(ev.id) ? "Remove Bookmark" : "Bookmark Event"}
                            >
                                <svg className="w-5 h-5" fill={savedIds.has(ev.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-[#1F2937] text-[#9CA3AF] border border-[#374151]">
                                {ev.city} • {ev.event_type}
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {ev.food_score > 0 && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#1F2937]/50 text-[#F3F4F6] border border-[#1F2937]">
                                    <span className="text-[10px]">🍕</span> {Math.round(ev.food_likelihood ? ev.food_likelihood * 100 : 80)}% Food Likelihood
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#1F2937]/50 text-[#F3F4F6] border border-[#1F2937]">
                                <span className="text-[#6366F1] text-[10px]">⭐</span> {Math.round(ev.total_score || ev.relevance_score)} Score
                            </span>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-[#1F2937] flex justify-between items-center w-full">
                            <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-bold">{ev.source}</span>
                            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 tracking-wide">
                                View <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-[#1F2937] rounded-2xl bg-[#111827]/50 mt-4">
                    <svg className="w-10 h-10 text-[#4B5563] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-[#F3F4F6]">No signals detected</h3>
                    <p className="text-[#9CA3AF] mt-2 max-w-sm text-sm">Adjust your radar parameters above and execute a new scan to find opportunities.</p>
                </div>
            )}
        </div>
    );
}
