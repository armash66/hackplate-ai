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

    useEffect(() => { setMounted(true); loadSavedEvents(); }, []);

    async function loadSavedEvents() {
        try {
            const token = await getToken();
            if (token) {
                const res = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
                setSavedIds(new Set(res.data.map(e => e.id)));
            }
        } catch (e) { console.error("Failed to load saved events:", e); }
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
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function toggleSave(id) {
        try {
            const token = await getToken();
            if (!token) { alert("Please sign in to save events."); return; }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (savedIds.has(id)) {
                await unsaveEvent(id, config);
                setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await saveEvent(id, config);
                setSavedIds(prev => { const n = new Set(prev); n.add(id); return n; });
            }
        } catch (err) { console.error("Save failed", err); }
    }

    return (
        <div>
            {/* ── Hero ── */}
            <div className="mb-8">
                <h1 className="mb-1">Search</h1>
                <p className="text-[15px] text-[#6B7280]">Filter events by location, source, type, and score.</p>
            </div>

            {/* ── Filters ── */}
            <div className="surface rounded-lg p-5 mb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    <div className="col-span-2 lg:col-span-2">
                        <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Location</label>
                        <input className="field" placeholder="e.g. Mumbai" value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Radius (km)</label>
                        <input className="field" type="number" value={filters.radius_km}
                            onChange={(e) => setFilters({ ...filters, radius_km: +e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Min score</label>
                        <input className="field" type="number" value={filters.min_score}
                            onChange={(e) => setFilters({ ...filters, min_score: +e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Source</label>
                        <select className="field" value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                            <option value="">All</option>
                            <option value="devfolio">Devfolio</option>
                            <option value="unstop">Unstop</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Type</label>
                        <select className="field" value={filters.event_type}
                            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}>
                            <option value="">Any</option>
                            <option value="Online">Online</option>
                            <option value="Offline">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E5E7EB]">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#6B7280]">
                        <input type="checkbox" className="accent-[#D97706] w-3.5 h-3.5" checked={filters.food_only}
                            onChange={(e) => setFilters({ ...filters, food_only: e.target.checked })} />
                        Food events only
                    </label>
                    <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching…" : "Search"}
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            <section>
                <h2 className="mb-4">Results</h2>

                {results.length === 0 && !loading ? (
                    <div className="surface rounded-lg py-16 flex flex-col items-center text-center">
                        <svg className="w-10 h-10 text-[#D1D5DB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-base font-semibold mb-1">No results</h3>
                        <p className="text-sm text-[#9CA3AF] max-w-xs">Adjust your filters and search again.</p>
                    </div>
                ) : (
                    <div className="surface rounded-lg divide-y divide-[#E5E7EB]">
                        {results.map((ev) => (
                            <div key={ev.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[#F9FAFB] transition-colors duration-150 group">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] font-semibold truncate group-hover:text-[#4F46E5] transition-colors mb-1">{ev.title}</h3>
                                    <p className="text-sm text-[#6B7280] line-clamp-1 mb-2">{ev.description || "No description."}</p>
                                    <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                                        <span>{ev.city}</span>
                                        <span>·</span>
                                        <span>{ev.event_type}</span>
                                        <span>·</span>
                                        <span className="uppercase tracking-wide">{ev.source}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                    {ev.food_score > 0 && <span className="badge badge-food">🍕 Food</span>}
                                    <span className="badge badge-score">{Math.round(ev.total_score || ev.relevance_score)}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                    <button onClick={() => toggleSave(ev.id)}
                                        className={`p-1 rounded transition-colors ${savedIds.has(ev.id) ? 'text-[#4F46E5]' : 'text-[#D1D5DB] hover:text-[#6B7280]'}`}>
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
