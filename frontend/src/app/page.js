"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { getOverview, searchEvents, triggerIngest } from "../lib/api";

export default function Home() {
    const { getToken } = useAuth();
    const [overview, setOverview] = useState(null);
    const [events, setEvents] = useState([]);
    const [ingesting, setIngesting] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const [ov, ev, savedRes] = await Promise.all([
                getOverview(config),
                searchEvents({ per_page: 8 }, config),
                token ? api.get("/events/saved/list", config).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);
            setOverview(ov.data);
            setEvents(ev.data);
            if (savedRes.data) setSavedIds(new Set(savedRes.data.map(e => e.id)));
        } catch (e) { console.error(e); }
    }

    async function handleIngest() {
        setIngesting(true);
        try {
            const token = await getToken();
            const res = await triggerIngest(token, 10);
            alert(`${res.data.new_events} new events found.`);
            loadData();
        } catch (e) {
            alert(e.response?.status === 401 ? "Please sign in first." : "Scan failed.");
        }
        setIngesting(false);
    }

    async function toggleSave(id) {
        try {
            const token = await getToken();
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (savedIds.has(id)) {
                await api.delete(`/events/${id}/save`, config);
                setSavedIds(p => { const n = new Set(p); n.delete(id); return n; });
            } else {
                await api.post(`/events/${id}/save`, {}, config);
                setSavedIds(p => { const n = new Set(p); n.add(id); return n; });
            }
        } catch (err) { console.error(err); }
    }

    return (
        <div>
            {/* ── Header ── */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                    <div>
                        <h1>Overview</h1>
                        <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>
                            Your event intelligence at a glance.
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleIngest} disabled={ingesting}
                        style={{ marginTop: 4 }}>
                        {ingesting ? "Scanning…" : "Scan now"}
                    </button>
                </div>
            </div>

            {/* ── Key Metrics ── */}
            {overview && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 24, marginBottom: 32
                }}>
                    <MetricBlock value={overview.total_events} label="Total events" />
                    <MetricBlock value={overview.food_events} label="With food" accent />
                    <MetricBlock value={overview.total_sources} label="Active sources" />
                </div>
            )}

            {/* ── Recent Events ── */}
            <section>
                <h2 style={{ marginBottom: 16 }}>Recent events</h2>

                {events.length === 0 ? (
                    <EmptyState
                        message="No events found yet."
                        sub="Run a scan to discover events near you."
                        action={<button className="btn btn-primary" onClick={handleIngest}>Run first scan</button>}
                    />
                ) : (
                    <div style={{
                        background: 'white', border: '1px solid #E5E7EB',
                        borderRadius: 8, overflow: 'hidden'
                    }}>
                        {events.map((ev, i) => (
                            <div key={ev.id} style={{
                                padding: '20px 24px',
                                borderTop: i > 0 ? '1px solid #F3F4F6' : 'none',
                                display: 'flex', alignItems: 'flex-start', gap: 16,
                                transition: 'background 150ms ease',
                                cursor: 'default',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                                        {ev.title}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>
                                        {ev.city}
                                        {ev.source && <> · <span style={{ textTransform: 'capitalize' }}>{ev.source}</span></>}
                                        {ev.created_at && <> · {new Date(ev.created_at).toLocaleDateString()}</>}
                                    </div>
                                    <div style={{
                                        fontSize: 14, color: '#6B7280', lineHeight: 1.5,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                    }}>
                                        {ev.description || "No description available."}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
                                    {ev.food_score > 0 && (
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, padding: '2px 8px',
                                            borderRadius: 4, background: '#FFFBEB', color: '#D97706'
                                        }}>Food</span>
                                    )}
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                                        borderRadius: 4, background: '#EEF2FF', color: '#4F46E5'
                                    }}>{Math.round(ev.total_score || ev.relevance_score)}</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0, paddingTop: 2 }}>
                                    <button onClick={() => toggleSave(ev.id)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                        color: savedIds.has(ev.id) ? '#4F46E5' : '#D1D5DB',
                                        transition: 'color 150ms ease'
                                    }}>
                                        <svg width="16" height="16" fill={savedIds.has(ev.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </button>
                                    <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{
                                        padding: 4, color: '#D1D5DB', transition: 'color 150ms ease',
                                        display: 'flex', alignItems: 'center'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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

function MetricBlock({ value, label, accent }) {
    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{
                fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em',
                color: accent ? '#D97706' : '#111827', marginBottom: 4
            }}>{value}</div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>{label}</div>
        </div>
    );
}

function EmptyState({ message, sub, action }) {
    return (
        <div style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
            padding: '64px 32px', textAlign: 'center', display: 'flex',
            flexDirection: 'column', alignItems: 'center'
        }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{message}</div>
            <div style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 280, marginBottom: 20 }}>{sub}</div>
            {action}
        </div>
    );
}
