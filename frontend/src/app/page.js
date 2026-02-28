"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getOverview, searchEvents, triggerIngest } from "../lib/api";

export default function Home() {
    const { getToken } = useAuth();
    const [overview, setOverview] = useState(null);
    const [recentEvents, setRecentEvents] = useState([]);
    const [ingesting, setIngesting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const [ov, ev] = await Promise.all([
                getOverview(config),
                searchEvents({ food_only: true, per_page: 6 }, config),
            ]);
            setOverview(ov.data);
            setRecentEvents(ev.data);
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

    return (
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            {/* HERO SECTION */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Opportunity Radar</h1>
                    <p className="text-[#9CA3AF] mt-1 text-sm font-medium">AI-ranked tech events tailored to your location.</p>
                </div>
                <button 
                    className="bg-[#111827] hover:bg-[#1F2937] text-[#F3F4F6] font-medium py-2.5 px-6 rounded-full border border-[#1F2937] transition-all flex items-center gap-2 text-sm shadow-sm" 
                    onClick={handleIngest} 
                    disabled={ingesting}
                >
                    {ingesting ? (
                        <><svg className="animate-spin h-3.5 w-3.5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Scanning...</>
                    ) : (
                        <><svg className="w-3.5 h-3.5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Run Scan</>
                    )}
                </button>
            </div>

            {/* STATS TILES */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                        <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.total_events}</div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Events Near You</h3>
                    </div>
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                        <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.food_events}</div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span> Avg Food Confidence
                        </h3>
                    </div>
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                        <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.total_sources}</div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Active Sources</h3>
                    </div>
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                        <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight truncate">{overview.top_city}</div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Trending City</h3>
                    </div>
                </div>
            )}

            {/* EVENT GRID (No specific Layout Sidebars) */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentEvents.length === 0 ? (
                        <div className="col-span-full bg-[#111827] border border-[#1F2937] rounded-2xl p-10 text-center">
                            <p className="text-[#9CA3AF]">No events found in your radar area.</p>
                            <p className="text-sm text-[#9CA3AF] mt-2">Adjust your Saved Search or run the Scraper.</p>
                        </div>
                    ) : (
                        recentEvents.map((ev) => (
                            <div key={ev.id} className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-in-out flex flex-col h-full group relative overflow-hidden">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366F1]/20 to-transparent left-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-[17px] font-bold text-[#F3F4F6] leading-tight pr-4 group-hover:text-[#6366F1] transition-colors">{ev.title}</h3>
                                    <svg className="w-5 h-5 text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-[#1F2937] text-[#9CA3AF] border border-[#374151]">
                                        {ev.city} • Local Match
                                    </span>
                                </div>
                                
                                <p className="text-[#9CA3AF] text-sm mb-5 line-clamp-2 leading-relaxed">{ev.description || "Open to see opportunities..."}</p>
                                
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
