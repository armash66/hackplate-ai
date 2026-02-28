"use client";
import { useEffect, useState, useRef } from "react";
import { searchEvents } from "../../lib/api";

export default function MapPage() {
    const [events, setEvents] = useState([]);
    const mapRef = useRef(null);
    const ready = useRef(false);

    useEffect(() => {
        searchEvents({ per_page: 100 }).then(r => setEvents(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || events.length === 0 || ready.current) return;
        import("leaflet").then(L => {
            const map = L.map(mapRef.current).setView([20.59, 78.96], 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap",
            }).addTo(map);

            events.forEach(ev => {
                if (!ev.lat || !ev.lon) return;
                const c = ev.food_score > 0 ? "#E5A00D" : "#5B5BD6";
                L.marker([ev.lat, ev.lon], {
                    icon: L.divIcon({
                        className: "",
                        html: `<div style="width:8px;height:8px;border-radius:50%;background:${c};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.15)"></div>`,
                        iconSize: [8, 8], iconAnchor: [4, 4],
                    })
                }).addTo(map).bindPopup(`
                    <div style="font-family:Inter,system-ui,sans-serif">
                        <strong style="font-size:13px">${ev.title}</strong><br/>
                        <span style="font-size:12px;color:#737373">${ev.city}</span><br/>
                        <a href="${ev.url}" target="_blank" style="font-size:12px;color:#5B5BD6">Open ↗</a>
                    </div>
                `);
            });
            ready.current = true;
        });
    }, [events]);

    const plotted = events.filter(e => e.lat).length;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Map</h1>
                    <p style={{ fontSize: 14, color: '#737373' }}>{plotted} events plotted</p>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#A3A3A3', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E5A00D', display: 'inline-block' }} /> Food
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B5BD6', display: 'inline-block' }} /> Other
                    </span>
                </div>
            </div>
            <div style={{ border: '1px solid #EBEBEB', borderRadius: 10, overflow: 'hidden', height: '65vh', background: '#FFF' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </>
    );
}
