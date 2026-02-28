"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getSavedEvents, unsaveEvent } from "../../lib/api";

export default function SavedPage() {
    const [items, setItems] = useState([]);
    const { getToken } = useAuth();

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            const token = await getToken();
            if (!token) return;
            const r = await getSavedEvents({ headers: { Authorization: `Bearer ${token}` } });
            setItems(r.data);
        } catch (_) { }
    }

    async function remove(id) {
        try {
            const token = await getToken();
            await unsaveEvent(id, { headers: { Authorization: `Bearer ${token}` } });
            setItems(p => p.filter(x => x.id !== id));
        } catch (_) { }
    }

    return (
        <>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Saved</h1>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 28 }}>Your bookmarked events.</p>

            {items.length === 0 ? (
                <div style={{
                    background: '#FFF', border: '1px solid #EBEBEB', borderRadius: 10,
                    padding: '48px 24px', textAlign: 'center',
                }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Nothing saved</p>
                    <p style={{ fontSize: 14, color: '#A3A3A3' }}>Bookmark events from the dashboard to see them here.</p>
                </div>
            ) : (
                <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: 10, overflow: 'hidden' }}>
                    {items.map((ev, i) => (
                        <div key={ev.id} style={{
                            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                            borderTop: i > 0 ? '1px solid #F5F5F4' : 'none',
                            transition: 'background 120ms',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                            onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
                        >
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: ev.food_likelihood > 0.5 ? '#E5A00D' : '#5B5BD6',
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{ev.title}</span>
                                <p style={{ fontSize: 12, color: '#A3A3A3', marginTop: 1 }}>{ev.city}{ev.source && ` · ${ev.source}`}</p>
                            </div>
                            <button onClick={() => remove(ev.id)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 12, color: '#A3A3A3', padding: '4px 8px',
                                borderRadius: 4, transition: 'color 120ms, background 120ms',
                            }}
                                onMouseEnter={e => { e.target.style.color = '#DC2626'; e.target.style.background = '#FEF2F2'; }}
                                onMouseLeave={e => { e.target.style.color = '#A3A3A3'; e.target.style.background = 'transparent'; }}
                            >Remove</button>
                            <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{
                                fontSize: 12, color: '#5B5BD6', fontWeight: 500,
                            }}>Open ↗</a>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
