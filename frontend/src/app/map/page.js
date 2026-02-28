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
        if (mapInstance.current) return; // already initialized

        import("leaflet").then((L) => {
            const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center
            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                attribution: "&copy; OpenStreetMap &copy; CARTO",
            }).addTo(map);

            events.forEach((ev) => {
                if (!ev.lat || !ev.lon) return;

                // Ensure we use the strict SaaS colors, not arbitrary values
                const color = ev.food_score > 0 ? "#F59E0B" : "#6366F1";
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="
            width:14px; height:14px; border-radius:50%;
            background:${color}; border:2px solid #0B0F1A;
            box-shadow: 0 1px 2px rgba(0,0,0,0.5);
          "></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });

                L.marker([ev.lat, ev.lon], { icon })
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:'Inter',sans-serif; min-width:200px; padding: 6px; border-radius: 8px;">
              <strong style="color: #111827; font-size: 1.05rem;">${ev.title}</strong><br/>
              <span style="font-size:0.85em; color:#4B5563; display: inline-block; margin-top: 4px;">
                ${ev.city} &middot; Score: ${Math.round(ev.relevance_score)}
                ${ev.food_score > 0 ? " &middot; <strong style='color:#F59E0B'>Food</strong>" : ""}
              </span><br/>
              <a href="${ev.url}" target="_blank" style="display: inline-block; margin-top: 8px; font-size:0.85em; color: #6366F1; text-decoration: none; font-weight: bold;">View Event &rarr;</a>
            </div>
          `);
            });

            mapInstance.current = map;
        });
    }, [events]);

    return (
        <div className="space-y-12">
            <div>
                <h1 className="mb-2">Geospatial Discovery</h1>
                <p className="text-[#9CA3AF] text-lg font-medium">Real-time visualization of tech and food signals across the global network.</p>
            </div>
            
            <div className="premium-card p-0 overflow-hidden shadow-2xl">
                <div
                    ref={mapRef}
                    className="z-10 relative bg-[#0B0F1A]"
                    style={{ height: "65vh" }}
                />
            </div>
            
            <div className="premium-card py-4 inline-flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> 
                    <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Food Drops</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div> 
                    <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Tech Signals</span>
                </div>
                <div className="pl-6 border-l border-[#1F2937]">
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mr-2">Status</span>
                    <strong className="text-[#F3F4F6] font-mono">{events.filter(e => e.lat).length}</strong> Plotted
                </div>
            </div>
        </div>
    );
}
