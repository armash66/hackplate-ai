"use client";
import { useEffect, useState, useRef } from "react";
import { searchEvents } from "../../lib/api";

export default function MapPage() {
    const [events, setEvents] = useState([]);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        searchEvents({ per_page: 100 }).then((res) => setEvents(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || events.length === 0) return;
        if (mapInstance.current) return;

        import("leaflet").then((L) => {
            const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            events.forEach((ev) => {
                if (!ev.lat || !ev.lon) return;
                const color = ev.food_score > 0 ? "#D97706" : "#4F46E5";
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5],
                });

                L.marker([ev.lat, ev.lon], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:'Inter',sans-serif;min-width:180px;">
                            <strong style="font-size:14px;color:#111827;">${ev.title}</strong><br/>
                            <span style="font-size:12px;color:#6B7280;">${ev.city} · Score: ${Math.round(ev.relevance_score)}${ev.food_score > 0 ? " · <span style='color:#D97706'>Food</span>" : ""}</span><br/>
                            <a href="${ev.url}" target="_blank" style="font-size:12px;color:#4F46E5;text-decoration:none;display:inline-block;margin-top:6px;">View →</a>
                        </div>
                    `);
            });

            mapInstance.current = map;
        });
    }, [events]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="mb-1">Map</h1>
                <p className="text-[15px] text-[#6B7280]">Geographical overview of events near you.</p>
            </div>

            <div className="surface rounded-lg overflow-hidden" style={{ height: "60vh" }}>
                <div ref={mapRef} className="w-full h-full" />
            </div>

            <div className="flex items-center gap-5 mt-4 text-[12px] text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#D97706]"></div>
                    <span>Food events</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
                    <span>Other events</span>
                </div>
                <span>·</span>
                <span><strong className="text-[#111827] font-medium">{events.filter(e => e.lat).length}</strong> plotted</span>
            </div>
        </div>
    );
}
