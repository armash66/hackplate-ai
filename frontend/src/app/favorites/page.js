"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { getSavedEvents, unsaveEvent } from "../../lib/api";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const { getToken } = useAuth();

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            const token = await getToken();
            if (!token) return;
            const res = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
            setFavorites(res.data);
        } catch (e) { console.error(e); }
    }

    async function handleUnsave(id) {
        try {
            const token = await getToken();
            await unsaveEvent(id, { headers: { Authorization: `Bearer ${token}` } });
            setFavorites(prev => prev.filter(e => e.id !== id));
        } catch (e) { console.error(e); }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="mb-1">Saved events</h1>
                <p className="text-[15px] text-[#6B7280]">Events you've bookmarked for later.</p>
            </div>

            {favorites.length === 0 ? (
                <div className="surface rounded-lg py-16 flex flex-col items-center text-center">
                    <svg className="w-10 h-10 text-[#D1D5DB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <h3 className="text-base font-semibold mb-1">Nothing saved yet</h3>
                    <p className="text-sm text-[#9CA3AF] max-w-xs mb-5">Bookmark events from the dashboard or search to see them here.</p>
                    <a href="/search" className="btn btn-primary">Browse events</a>
                </div>
            ) : (
                <div className="surface rounded-lg divide-y divide-[#E5E7EB]">
                    {favorites.map((ev) => (
                        <div key={ev.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[#F9FAFB] transition-colors duration-150 group">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-semibold truncate group-hover:text-[#4F46E5] transition-colors mb-1">{ev.title}</h3>
                                <p className="text-sm text-[#6B7280] line-clamp-1 mb-2">{ev.description || "No description."}</p>
                                <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
                                    <span>{ev.city}</span>
                                    {ev.source && <><span>·</span><span className="uppercase tracking-wide">{ev.source}</span></>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                {ev.food_likelihood > 0.5 && <span className="badge badge-food">🍕 Food</span>}
                                <span className="badge badge-score">{Math.round(ev.total_score || 85)}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                <button onClick={() => handleUnsave(ev.id)} className="p-1 rounded text-[#4F46E5] hover:text-[#EF4444] transition-colors" title="Unsave">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                </button>
                                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-[#D1D5DB] hover:text-[#6B7280] transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
