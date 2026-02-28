"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { searchEvents, saveEvent, unsaveEvent, getSavedEvents } from "../../lib/api";

export default function EventsPage() {
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState({
        location: "", radius_km: 50, min_score: 0,
        source: "", event_type: "", food_only: false,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());
    const { getToken } = useAuth();

    useEffect(() => { setMounted(true); loadSaved(); }, []);

    async function loadSaved() {
        try {
            const token = await getToken();
            if (token) {
                const res = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
                setSavedIds(new Set(res.data.map(e => e.id)));
            }
        } catch (e) { console.error(e); }
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
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (savedIds.has(id)) {
                await unsaveEvent(id, config);
                setSavedIds(p => { const n = new Set(p); n.delete(id); return n; });
            } else {
                await saveEvent(id, config);
                setSavedIds(p => { const n = new Set(p); n.add(id); return n; });
            }
        } catch (err) { console.error(err); }
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1>Events</h1>
                <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>Browse and filter all discovered events.</p>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: 20, marginBottom: 32
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Location</label>
                        <input className="field" placeholder="e.g. Mumbai" value={filters.location}
                            onChange={e => setFilters({ ...filters, location: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Radius (km)</label>
                        <input className="field" type="number" value={filters.radius_km}
                            onChange={e => setFilters({ ...filters, radius_km: +e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Min score</label>
                        <input className="field" type="number" value={filters.min_score}
                            onChange={e => setFilters({ ...filters, min_score: +e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Source</label>
                        <select className="field" value={filters.source}
                            onChange={e => setFilters({ ...filters, source: e.target.value })}>
                            <option value="">All</option>
                            <option value="devfolio">Devfolio</option>
                            <option value="unstop">Unstop</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Type</label>
                        <select className="field" value={filters.event_type}
                            onChange={e => setFilters({ ...filters, event_type: e.target.value })}>
                            <option value="">Any</option>
                            <option value="Online">Online</option>
                            <option value="Offline">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.food_only} onChange={e => setFilters({ ...filters, food_only: e.target.checked })}
                            style={{ accentColor: '#D97706' }} />
                        Food events only
                    </label>
                    <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching…" : "Search"}
                    </button>
                </div>
            </div>

            {/* Results Table */}
            {results.length === 0 && !loading ? (
                <div style={{
                    background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                    padding: '64px 32px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>No results</div>
                    <div style={{ fontSize: 14, color: '#9CA3AF' }}>Adjust your filters and search again.</div>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 120px 70px 100px 60px',
                        padding: '10px 24px', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB',
                        fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        <span>Event</span>
                        <span>Location</span>
                        <span>Score</span>
                        <span>Date</span>
                        <span></span>
                    </div>

                    {results.map((ev, i) => (
                        <div key={ev.id} style={{
                            display: 'grid', gridTemplateColumns: '1fr 120px 70px 100px 60px',
                            padding: '14px 24px', alignItems: 'center',
                            borderTop: i > 0 ? '1px solid #F3F4F6' : 'none',
                            transition: 'background 150ms ease', cursor: 'default'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{ev.source}</div>
                            </div>
                            <span style={{ fontSize: 13, color: '#6B7280' }}>{ev.city}</span>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#EEF2FF', color: '#4F46E5' }}>
                                    {Math.round(ev.total_score || ev.relevance_score)}
                                </span>
                                {ev.food_score > 0 && (
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#FFFBEB', color: '#D97706', marginLeft: 4 }}>🍕</span>
                                )}
                            </div>
                            <span style={{ fontSize: 13, color: '#9CA3AF' }}>{ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '—'}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => toggleSave(ev.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                    color: savedIds.has(ev.id) ? '#4F46E5' : '#D1D5DB'
                                }}>
                                    <svg width="14" height="14" fill={savedIds.has(ev.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                </button>
                                <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ padding: 2, color: '#D1D5DB' }}>
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
