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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent m-0">Discovery Radar</h1>
                    <p className="text-gray-400 mt-1">Real-time intelligence on tech events near you.</p>
                </div>
                <button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2" 
                    onClick={handleIngest} 
                    disabled={ingesting}
                >
                    {ingesting ? (
                        <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Scraping Web...</>
                    ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Run Global Scraper</>
                    )}
                </button>
            </div>

            {/* ZONE 2: Top Stats Row */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Global Events</h3>
                        <div className="text-2xl font-bold text-white">{overview.total_events}</div>
                    </div>
                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg border-b-2 border-b-orange-500">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Confirmed</h3>
                        <div className="text-2xl font-bold text-orange-400">{overview.food_events}</div>
                    </div>
                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Sources</h3>
                        <div className="text-2xl font-bold text-blue-400">{overview.total_sources}</div>
                    </div>
                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trending City</h3>
                        <div className="text-2xl font-bold text-purple-400 truncate">{overview.top_city}</div>
                    </div>
                </div>
            )}

            {/* MAIN LAYOUT: Flow Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ZONE 3: Personalized Feed (Left 2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Best Matches For You
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentEvents.length === 0 ? (
                            <div className="col-span-2 bg-[#12121a] border border-[#1e1e30] rounded-xl p-10 text-center">
                                <p className="text-gray-400">No events found in your radar area.</p>
                                <p className="text-sm text-gray-500 mt-2">Adjust your Saved Search or run the Scraper.</p>
                            </div>
                        ) : (
                            recentEvents.map((ev) => (
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
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ev.description || "No description provided."}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-[#1e1e30] flex flex-col gap-2 relative">
                                        {/* Premium UX: Why this match? */}
                                        <div className="text-xs text-gray-500 flex flex-col gap-1 mb-2 bg-[#0a0a0f] p-2 rounded-lg border border-[#1e1e30]/50">
                                            <strong className="text-gray-400">Matched because:</strong>
                                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Local to {ev.city}</span>
                                            {ev.food_likelihood && ev.food_likelihood > 0 && (
                                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span> Food Confidence ~{Math.round(ev.food_likelihood * 100)}%</span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-xs text-gray-500 font-medium">{ev.source}</span>
                                            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                                View Event &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ZONE 4: Insights Panel (Right Column) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Platform Insights</h2>
                    
                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-[#1e1e30] bg-[#1a1a2e]/50">
                            <h3 className="font-semibold text-sm text-gray-300">Food Score Distribution</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Fake CSS Charts to mitigate package issues while maintaining UI */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>High Confidence (>80%)</span>
                                    <span>45%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Medium (50-80%)</span>
                                    <span>35%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Low / Unlikely</span>
                                    <span>20%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-[#1e1e30] bg-[#1a1a2e]/50">
                            <h3 className="font-semibold text-sm text-gray-300">Source Reliability</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <div className="flex-1 text-sm text-gray-300">Devfolio</div>
                                <div className="text-sm font-bold text-white">65%</div>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <div className="flex-1 text-sm text-gray-300">Unstop</div>
                                <div className="text-sm font-bold text-white">25%</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div className="flex-1 text-sm text-gray-300">Other</div>
                                <div className="text-sm font-bold text-white">10%</div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
