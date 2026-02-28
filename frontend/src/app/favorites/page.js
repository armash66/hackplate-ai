"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../lib/api";

export default function FavoritesPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setLoading(false);
            return;
        }

        async function loadFavorites() {
            try {
                const token = await getToken();
                const res = await api.get("/events/saved/list", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(res.data);
            } catch (err) {
                console.error("Failed to load favorites", err);
            } finally {
                setLoading(false);
            }
        }
        
        loadFavorites();
    }, [isLoaded, isSignedIn]);

    const handleUnsave = async (eventId) => {
        try {
            const token = await getToken();
            await api.delete(`/events/${eventId}/save`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from local state
            setEvents(events.filter(e => e.id !== eventId));
        } catch (err) {
            console.error(err);
            alert("Failed to remove bookmark.");
        }
    };

    if (!isLoaded || loading) return <div className="p-8 text-[#9CA3AF]">Loading your saved drops...</div>;

    if (!isSignedIn) {
        return (
            <div className="page h-full flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight mb-4">Saved Opportunities</h1>
                <p className="text-[#9CA3AF] text-sm font-medium">Please sign in to view and manage your bookmarked events.</p>
            </div>
        );
    }

    return (
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Favorites</h1>
                <p className="text-[#9CA3AF] mt-1 text-sm font-medium">Your curated list of saved tech & food events.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length === 0 ? (
                        <div className="col-span-full bg-[#111827] border border-[#1F2937] rounded-2xl p-10 text-center">
                            <p className="text-[#9CA3AF]">No saved events found.</p>
                            <p className="text-sm text-[#9CA3AF] mt-2">Browse the Dashboard or Search to bookmark opportunities.</p>
                        </div>
                    ) : (
                        events.map((ev) => (
                            <div key={ev.id} className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-in-out flex flex-col h-full group relative overflow-hidden">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366F1]/20 to-transparent left-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-[17px] font-bold text-[#F3F4F6] leading-tight pr-4 group-hover:text-[#6366F1] transition-colors">{ev.title}</h3>
                                    <button onClick={() => handleUnsave(ev.id)} className="text-[#6366F1] hover:text-[#4F46E5] transition-colors shrink-0" title="Remove Bookmark">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-[#1F2937] text-[#9CA3AF] border border-[#374151]">
                                        {ev.city}
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
