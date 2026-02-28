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
            <div style={{ marginBottom: 24 }}>
                <h1>Saved</h1>
                <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>Events you've bookmarked.</p>
            </div>

            {favorites.length === 0 ? (
                <div style={{
                    background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                    padding: '64px 32px', textAlign: 'center'
                }}>
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth="1.5" style={{ marginBottom: 16, display: 'inline-block' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>No saved events</div>
                    <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>Bookmark events from the dashboard or search.</div>
                    <a href="/search" className="btn btn-primary">Browse events</a>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                    {favorites.map((ev, i) => (
                        <div key={ev.id} style={{
                            padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
                            borderTop: i > 0 ? '1px solid #F3F4F6' : 'none',
                            transition: 'background 150ms ease'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{ev.title}</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                                    {ev.city}{ev.source && ` · ${ev.source}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => handleUnsave(ev.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#EF4444'
                                }} title="Remove">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ padding: 4, color: '#D1D5DB', display: 'flex' }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
