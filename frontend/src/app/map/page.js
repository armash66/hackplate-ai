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

                const color = ev.food_score > 0 ? "#fd79a8" : "#6c5ce7";
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="
            width:14px; height:14px; border-radius:50%;
            background:${color}; border:2px solid #fff;
            box-shadow:0 0 10px ${color};
          "></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });

                L.marker([ev.lat, ev.lon], { icon })
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:Inter,sans-serif; min-width:200px;">
              <strong>${ev.title}</strong><br/>
              <span style="font-size:0.85em; color:#888;">
                ${ev.city} &middot; Score: ${ev.relevance_score}
                ${ev.food_score > 0 ? " &middot; Food" : ""}
              </span><br/>
              <a href="${ev.url}" target="_blank" style="font-size:0.85em;">View &rarr;</a>
            </div>
          `);
            });

            mapInstance.current = map;
        });
    }, [events]);

    return (
        <div className="page">
            <h1>Event Map</h1>
            <div
                ref={mapRef}
                style={{
                    height: "70vh", borderRadius: 16,
                    border: "1px solid var(--border)", overflow: "hidden",
                }}
            />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 12 }}>
                Pink = food events &middot; Purple = other events &middot; {events.filter(e => e.lat).length} events on map
            </p>
        </div>
    );
}
