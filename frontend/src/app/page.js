"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import api, { getOverview, searchEvents, triggerIngest } from "../lib/api";

export default function Dashboard() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState(null);
    const [feed, setFeed] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [saved, setSaved] = useState(new Set());

    useEffect(() => { refresh(); }, []);

    async function refresh() {
        try {
            const token = await getToken();
            const h = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const [s, e, sv] = await Promise.all([
                getOverview(h),
                searchEvents({ per_page: 10 }, h),
                token ? api.get("/events/saved/list", h).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);
            setStats(s.data);
            setFeed(e.data);
            if (sv.data) setSaved(new Set(sv.data.map(x => x.id)));
        } catch (e) { console.error(e); }
    }

    async function scan() {
        setScanning(true);
        try {
            const token = await getToken();
            await triggerIngest(token, 10);
            refresh();
        } catch (e) {
            alert(e.response?.status === 401 ? "Sign in first." : "Scan failed.");
        }
        setScanning(false);
    }

    async function toggleBookmark(id) {
        const token = await getToken();
        if (!token) return;
        const h = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (saved.has(id)) {
                await api.delete(`/events/${id}/save`, h);
                setSaved(p => { const n = new Set(p); n.delete(id); return n; });
            } else {
                await api.post(`/events/${id}/save`, {}, h);
                setSaved(p => { const n = new Set(p); n.add(id); return n; });
            }
        } catch (_) { }
    }

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
                        Dashboard
                    </h1>
                    {stats && (
                        <p style={{ fontSize: 14, color: '#737373' }}>
                            {stats.total_events} events tracked
                            <Dot />{stats.food_events} with food
                            <Dot />{stats.total_sources} sources
                        </p>
                    )}
                </div>
                <button onClick={scan} disabled={scanning} style={{
                    background: '#5B5BD6', color: '#FFF', border: 'none',
                    borderRadius: 8, padding: '9px 18px', fontSize: 13,
                    fontWeight: 600, cursor: 'pointer', opacity: scanning ? 0.6 : 1,
                }}>
                    {scanning ? "Scanning…" : "Scan for events"}
                </button>
            </div>

            {/* Feed */}
            {feed.length === 0 ? (
                <div style={{
                    border: '1px solid #EBEBEB', borderRadius: 10,
                    background: '#FFF', padding: '56px 24px',
                    textAlign: 'center',
                }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                        No events yet
                    </p>
                    <p style={{ fontSize: 14, color: '#A3A3A3', marginBottom: 20 }}>
                        Hit "Scan for events" to discover hackathons near you.
                    </p>
                    <button onClick={scan} style={{
                        background: '#5B5BD6', color: '#FFF', border: 'none',
                        borderRadius: 8, padding: '9px 18px', fontSize: 13,
                        fontWeight: 600, cursor: 'pointer',
                    }}>Run first scan</button>
                </div>
            ) : (
                <div style={{ border: '1px solid #EBEBEB', borderRadius: 10, background: '#FFF', overflow: 'hidden' }}>
                    {feed.map((ev, i) => (
                        <EventRow
                            key={ev.id} ev={ev} i={i}
                            bookmarked={saved.has(ev.id)}
                            onToggle={() => toggleBookmark(ev.id)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

/* ── Row ── */
function EventRow({ ev, i, bookmarked, onToggle }) {
    const [hover, setHover] = useState(false);
    const score = Math.round(ev.total_score || ev.relevance_score || 0);
    const hasFood = ev.food_score > 0;

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '18px 20px',
                borderTop: i > 0 ? '1px solid #F5F5F4' : 'none',
                background: hover ? '#FAFAF9' : '#FFF',
                transition: 'background 120ms',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
            }}
        >
            {/* Indicator dot */}
            <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 7, flexShrink: 0,
                background: hasFood ? '#E5A00D' : '#5B5BD6',
            }} />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{ev.title}</span>
                    {hasFood && (
                        <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: '#B45309', background: '#FEF3C7',
                            padding: '1px 6px', borderRadius: 4,
                        }}>Food</span>
                    )}
                </div>
                <p style={{
                    fontSize: 13, color: '#737373', marginBottom: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {ev.description || "No description."}
                </p>
                <p style={{ fontSize: 12, color: '#A3A3A3' }}>
                    {ev.city}
                    {ev.source && <><Dot />{ev.source}</>}
                    {ev.created_at && <><Dot />{new Date(ev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</>}
                </p>
            </div>

            {/* Score */}
            <span style={{
                fontSize: 12, fontWeight: 700, color: '#5B5BD6',
                background: '#F0EFFF', padding: '3px 8px', borderRadius: 5,
                flexShrink: 0, marginTop: 2,
            }}>{score}</span>

            {/* Bookmark */}
            <button onClick={onToggle} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                color: bookmarked ? '#5B5BD6' : '#D4D4D4',
                transition: 'color 120ms', flexShrink: 0, marginTop: 1,
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="2">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>

            {/* Open */}
            <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{
                color: '#D4D4D4', padding: 2, flexShrink: 0, marginTop: 1,
                transition: 'color 120ms',
            }}
                onMouseEnter={e => e.currentTarget.style.color = '#737373'}
                onMouseLeave={e => e.currentTarget.style.color = '#D4D4D4'}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        </div>
    );
}

function Dot() {
    return <span style={{ margin: '0 6px', color: '#D4D4D4' }}>·</span>;
}
