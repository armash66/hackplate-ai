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
        <div className="space-y-12">
            <div>
                <h1 className="mb-2">Your Favorites</h1>
                <p className="text-[#9CA3AF] text-lg font-medium">Tracked opportunities and high-value signals you've bookmarked.</p>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="m-0">Bookmarked Signals</h2>
                    <div className="h-px flex-1 bg-[#1F2937]"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.length === 0 ? (
                        <div className="col-span-full py-20 premium-card flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
                            <p className="text-[#9CA3AF] max-w-sm mb-8">Your tracked events will appear here for quick access and monitoring.</p>
                            <button className="btn-premium btn-primary" onClick={() => window.location.href='/search'}>Explore Opportunities</button>
                        </div>
                    ) : (
                        events.map((ev) => (
                            <div key={ev.id} className="premium-card group h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold leading-snug group-hover:text-[#6366F1] transition-colors">{ev.title}</h3>
                                    <button 
                                        onClick={() => handleUnsave(ev.id)} 
                                        className="transition-colors shrink-0 p-1 rounded-md hover:bg-[#1F2937] text-[#6366F1]"
                                        title="Remove from favorites"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
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
                                    {ev.food_likelihood > 0.5 && (
                                        <div className="badge-premium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 flex items-center gap-1">
                                            <span>🍕</span> {Math.round(ev.food_likelihood * 100)}% Food
                                        </div>
                                    )}
                                    <div className="badge-premium bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 flex items-center gap-1">
                                        <span>⭐</span> {Math.round(ev.total_score || 85)} Score
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-[#1F2937] flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-wider text-[#4B5563] font-black">{ev.source || 'Aggregated'}</span>
                                        <span className="text-[10px] text-[#6B7280]">Saved recently</span>
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
