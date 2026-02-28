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
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Event Map</h1>
                <p className="text-[#9CA3AF] mt-1 text-sm font-medium">Geospatial overview of active tech events.</p>
            </div>
            
            <div
                ref={mapRef}
                style={{
                    height: "65vh", 
                    borderRadius: 16,
                    border: "1px solid #1F2937", 
                    overflow: "hidden"
                }}
                className="z-10 relative bg-[#111827] shadow-sm"
            />
            
            <div className="flex items-center gap-4 mt-6 text-sm text-[#9CA3AF] bg-[#111827] border border-[#1F2937] p-4 rounded-2xl inline-flex shadow-sm font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div> 
                    <span>Food Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></div> 
                    <span>Other Events</span>
                </div>
                <div className="pl-4 border-l border-[#1F2937]">
                    <strong className="text-[#F3F4F6]">{events.filter(e => e.lat).length}</strong> events plotted
                </div>
            </div>
        </div>
    );
}
