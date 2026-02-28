"use client";
import { useState, useEffect } from "react";
import { searchEvents } from "../../lib/api";

export default function SearchPage() {
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState({
        location: "", radius_km: 50, min_score: 0,
        source: "", event_type: "", food_only: false,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    async function handleSearch() {
        setLoading(true);
        try {
            const params = {};
            if (filters.location) params.location = filters.location;
            if (filters.radius_km) params.radius_km = filters.radius_km;
            if (filters.min_score) params.min_score = filters.min_score;
            if (filters.source) params.source = filters.source;
            if (filters.event_type) params.event_type = filters.event_type;
            if (filters.food_only) params.food_only = true;
            const res = await searchEvents(params);
            setResults(res.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent m-0">Event Radar</h1>
                <p className="text-gray-400 mt-1">Filter and isolate specific high-value opportunities.</p>
            </div>

            <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-6 shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    <div className="flex flex-col gap-1.5 lg:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
                        <input className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" placeholder="e.g. Mumbai" value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Radius (km)</label>
                        <input className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" type="number" value={filters.radius_km}
                            onChange={(e) => setFilters({ ...filters, radius_km: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Score</label>
                        <input className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" type="number" value={filters.min_score}
                            onChange={(e) => setFilters({ ...filters, min_score: +e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</label>
                        <select className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none" value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                            <option value="">All Networks</option>
                            <option value="devfolio">Devfolio</option>
                            <option value="unstop">Unstop</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                        <select className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none" value={filters.event_type}
                            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}>
                            <option value="">Any Format</option>
                            <option value="Online">Online</option>
                            <option value="Offline">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#1e1e30]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${filters.food_only ? 'bg-orange-500' : 'bg-[#1a1a2e] border border-[#2a2a3e] group-hover:border-orange-500/50'}`}>
                            {filters.food_only && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={filters.food_only} onChange={(e) => setFilters({ ...filters, food_only: e.target.checked })} />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Require Food Provision</span>
                    </label>

                    <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-8 rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2" 
                        onClick={handleSearch} 
                        disabled={loading}
                    >
                        {loading ? 'Scanning...' : 'Execute Radar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((ev) => (
                    <div key={ev.id} className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-5 shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all flex flex-col h-full group">
                        <div className="flex gap-2 mb-3">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Score: {Math.round(ev.total_score || ev.relevance_score)}
                            </span>
                            {ev.food_score > 0 && (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    Food
                                </span>
                            )}
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                                {ev.event_type}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{ev.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{ev.city}</p>
                        
                        {ev.keywords && ev.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {ev.keywords.slice(0, 3).map((kw, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{kw}</span>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-auto pt-4 border-t border-[#1e1e30] flex justify-between items-center w-full">
                            <span className="text-xs text-gray-500 font-medium">{ev.source}</span>
                            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                Connect &rarr;
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-[#1e1e30] rounded-xl bg-[#0a0a0f]/50 mt-4">
                    <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-300">No signals detected</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Adjust your radar parameters above and execute a new scan to find opportunities.</p>
                </div>
            )}
        </div>
    );
}
