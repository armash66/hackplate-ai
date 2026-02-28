"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { searchEvents, saveEvent, unsaveEvent, getSavedEvents } from "../../lib/api";

export default function EventsPage() {
    const [ready, setReady] = useState(false);
    const [query, setQuery] = useState("");
    const [foodOnly, setFoodOnly] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(new Set());
    const { getToken } = useAuth();

    useEffect(() => {
        setReady(true);
        loadSaved();
        // Load initial results
        doSearch();
    }, []);

    async function loadSaved() {
        try {
            const token = await getToken();
            if (token) {
                const r = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
                setSaved(new Set(r.data.map(e => e.id)));
            }
        } catch (_) { }
    }

    async function doSearch() {
        setLoading(true);
        try {
            const token = await getToken();
            const h = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const params = {};
            if (query) params.location = query;
            if (foodOnly) params.food_only = true;
            const r = await searchEvents(params, h);
            setResults(r.data);
        } catch (_) { }
        setLoading(false);
    }

    async function toggleSave(id) {
        const token = await getToken();
        if (!token) return;
        const h = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (saved.has(id)) {
                await unsaveEvent(id, h);
                setSaved(p => { const n = new Set(p); n.delete(id); return n; });
            } else {
                await saveEvent(id, h);
                setSaved(p => { const n = new Set(p); n.add(id); return n; });
            }
        } catch (_) { }
    }

    if (!ready) return null;

    return (
        <>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Events</h1>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 28 }}>Browse all discovered hackathons and tech events.</p>

            {/* Search */}
            <div style={{
                display: 'flex', gap: 10, marginBottom: 28, alignItems: 'center',
            }}>
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                    placeholder="Search by city…"
                    style={{
                        flex: 1, padding: '10px 14px', fontSize: 14,
                        border: '1px solid #EBEBEB', borderRadius: 8,
                        outline: 'none', background: '#FFF', color: '#1A1A1A',
                    }}
                />
                <label style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#737373', cursor: 'pointer',
                    padding: '8px 14px', border: '1px solid #EBEBEB',
                    borderRadius: 8, background: foodOnly ? '#FEF3C7' : '#FFF',
                    transition: 'background 120ms',
                }}>
                    <input type="checkbox" checked={foodOnly} onChange={e => setFoodOnly(e.target.checked)}
                        style={{ display: 'none' }} />
                    🍕 Food only
                </label>
                <button onClick={doSearch} disabled={loading} style={{
                    background: '#5B5BD6', color: '#FFF', border: 'none',
                    borderRadius: 8, padding: '10px 20px', fontSize: 13,
                    fontWeight: 600, cursor: 'pointer',
                }}>
                    {loading ? "…" : "Search"}
                </button>
            </div>

            {/* Results */}
            {results.length === 0 ? (
                <div style={{
                    background: '#FFF', border: '1px solid #EBEBEB', borderRadius: 10,
                    padding: '48px 24px', textAlign: 'center',
                }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>No events found</p>
                    <p style={{ fontSize: 14, color: '#A3A3A3' }}>Try a different search or run a scan from the dashboard.</p>
                </div>
            ) : (
                <div style={{
                    background: '#FFF', border: '1px solid #EBEBEB',
                    borderRadius: 10, overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 100px 60px 50px',
                        padding: '8px 20px', borderBottom: '1px solid #EBEBEB',
                        fontSize: 11, fontWeight: 600, color: '#A3A3A3',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                        <span>Event</span>
                        <span>Location</span>
                        <span>Score</span>
                        <span></span>
                    </div>

                    {results.map((ev, i) => {
                        const score = Math.round(ev.total_score || ev.relevance_score || 0);
                        return (
                            <div key={ev.id} style={{
                                display: 'grid', gridTemplateColumns: '1fr 100px 60px 50px',
                                padding: '14px 20px', alignItems: 'center',
                                borderTop: '1px solid #F5F5F4',
                                transition: 'background 120ms',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                                onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{ev.title}</span>
                                        {ev.food_score > 0 && (
                                            <span style={{ fontSize: 10, fontWeight: 600, color: '#B45309', background: '#FEF3C7', padding: '1px 5px', borderRadius: 3 }}>Food</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 12, color: '#A3A3A3' }}>{ev.source} · {ev.event_type || 'Event'}</span>
                                </div>
                                <span style={{ fontSize: 13, color: '#737373' }}>{ev.city}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#5B5BD6' }}>{score}</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => toggleSave(ev.id)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                        color: saved.has(ev.id) ? '#5B5BD6' : '#D4D4D4',
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill={saved.has(ev.id) ? "currentColor" : "none"}
                                            stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </button>
                                    <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ color: '#D4D4D4', padding: 2 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
