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
        <div className="space-y-12">
            <div>
                <h1 className="mb-2">Opportunity Radar</h1>
                <p className="text-[#9CA3AF] text-lg font-medium">Filter and isolate specific high-value events across the network.</p>
            </div>

            <div className="premium-card">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Location</label>
                        <input className="input-premium w-full placeholder-[#4B5563]" placeholder="e.g. Mumbai" value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Radius (km)</label>
                        <input className="input-premium w-full" type="number" value={filters.radius_km}
                            onChange={(e) => setFilters({ ...filters, radius_km: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Min Score</label>
                        <input className="input-premium w-full" type="number" value={filters.min_score}
                            onChange={(e) => setFilters({ ...filters, min_score: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Source</label>
                        <select className="input-premium w-full appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }} value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                            <option value="">All Networks</option>
                            <option value="devfolio">Devfolio</option>
                            <option value="unstop">Unstop</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Type</label>
                        <select className="input-premium w-full appearance-none bg-no-repeat bg-[right_16px_center] cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }} value={filters.event_type}
                            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}>
                            <option value="">Any Format</option>
                            <option value="Online">Online</option>
                            <option value="Offline">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-8 border-t border-[#1F2937]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${filters.food_only ? 'bg-[#F59E0B] border-[#F59E0B]' : 'bg-[#0B0F1A] border border-[#1F2937] group-hover:border-[#6366F1]'}`}>
                            {filters.food_only && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={filters.food_only} onChange={(e) => setFilters({ ...filters, food_only: e.target.checked })} />
                        <span className="text-sm font-medium text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors">Require Food Provision</span>
                    </label>

                    <button 
                        className="btn-premium btn-primary px-8" 
                        onClick={handleSearch} 
                        disabled={loading}
                    >
                        {loading ? 'Scanning...' : 'Execute Radar'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="m-0">Search Results</h2>
                    <div className="h-px flex-1 bg-[#1F2937]"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {results.length === 0 && !loading ? (
                        <div className="col-span-full py-20 premium-card flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">No active signals found</h3>
                            <p className="text-[#9CA3AF] max-w-sm mb-8">Refine your radar parameters above and execute a new scan to isolate matches.</p>
                            <button className="btn-premium btn-secondary" onClick={() => setFilters({ ...filters, radius_km: 100 })}>Expand Search Range</button>
                        </div>
                    ) : (
                        results.map((ev) => (
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
                                        {ev.city} • {ev.event_type}
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
