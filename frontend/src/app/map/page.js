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
                const color = ev.food_score > 0 ? "#f97316" : "#6366f1"; // orange-500, indigo-500
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="
            width:16px; height:16px; border-radius:50%;
            background:${color}; border:2px solid #0a0a0f;
            box-shadow:0 0 12px ${color};
          "></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                });

                L.marker([ev.lat, ev.lon], { icon })
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:Inter,sans-serif; min-width:200px; padding: 4px; border-radius: 8px;">
              <strong style="color: #12121a; font-size: 1.1rem;">${ev.title}</strong><br/>
              <span style="font-size:0.85em; color:#4b5563; display: inline-block; margin-top: 4px;">
                ${ev.city} &middot; Score: ${Math.round(ev.relevance_score)}
                ${ev.food_score > 0 ? " &middot; <strong style='color:#f97316'>Food</strong>" : ""}
              </span><br/>
              <a href="${ev.url}" target="_blank" style="display: inline-block; margin-top: 8px; font-size:0.85em; color: #4f46e5; text-decoration: none; font-weight: bold;">View Event &rarr;</a>
            </div>
          `);
            });

            mapInstance.current = map;
        });
    }, [events]);

    return (
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent m-0">Event Map</h1>
                <p className="text-gray-400 mt-1">Geospatial overview of active tech events.</p>
            </div>
            
            <div
                ref={mapRef}
                style={{
                    height: "70vh", 
                    borderRadius: 16,
                    border: "1px solid #1e1e30", 
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
                className="z-10 relative" // Ensure map doesn't overflow z-index of next.js overlays
            />
            
            <div className="flex items-center gap-4 mt-6 text-sm text-gray-400 bg-[#12121a] border border-[#1e1e30] p-4 rounded-xl inline-flex shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div> 
                    <span>Food Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div> 
                    <span>Other Events</span>
                </div>
                <div className="pl-4 border-l border-gray-700">
                    <strong className="text-white">{events.filter(e => e.lat).length}</strong> events plotted
                </div>
            </div>
        </div>
    );
}
