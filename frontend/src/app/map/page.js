"use client";
import { useEffect, useState, useRef } from "react";
import { searchEvents } from "../../lib/api";

export default function MapPage() {
    const [events, setEvents] = useState([]);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        searchEvents({ per_page: 100 }).then(r => setEvents(r.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || events.length === 0) return;
        if (mapInstance.current) return;

        import("leaflet").then(L => {
            const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap"
            }).addTo(map);

            events.forEach(ev => {
                if (!ev.lat || !ev.lon) return;
                const color = ev.food_score > 0 ? "#D97706" : "#4F46E5";
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="width:8px;height:8px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.15);"></div>`,
                    iconSize: [8, 8], iconAnchor: [4, 4],
                });
                L.marker([ev.lat, ev.lon], { icon }).addTo(map).bindPopup(`
                    <div style="font-family:Inter,sans-serif">
                        <strong style="font-size:13px">${ev.title}</strong><br/>
                        <span style="font-size:12px;color:#6B7280">${ev.city} · ${Math.round(ev.relevance_score)}</span><br/>
                        <a href="${ev.url}" target="_blank" style="font-size:12px;color:#4F46E5">View →</a>
                    </div>
                `);
            });
            mapInstance.current = map;
        });
    }, [events]);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1>Map</h1>
                <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>Geographical overview of events.</p>
            </div>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', height: '60vh' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} /> Food
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} /> Other
                </span>
                <span>· {events.filter(e => e.lat).length} plotted</span>
            </div>
        </div>
    );
}
