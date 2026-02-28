"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getOverview, searchEvents, triggerIngest } from "../lib/api";

export default function Home() {
    const { getToken } = useAuth();
    const [overview, setOverview] = useState(null);
    const [recentEvents, setRecentEvents] = useState([]);
    const [ingesting, setIngesting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const [ov, ev] = await Promise.all([
                getOverview(config),
                searchEvents({ food_only: true, per_page: 6 }, config),
            ]);
            setOverview(ov.data);
            setRecentEvents(ev.data);
        } catch (e) {
            console.error("Failed to load dashboard:", e);
        }
    }

    async function handleIngest() {
        setIngesting(true);
        try {
            const token = await getToken();
            const res = await triggerIngest(token, 10);
            alert(`Ingestion complete! ${res.data.new_events} new events found.`);
            loadData();
        } catch (e) {
            if (e.response && e.response.status === 401) {
                alert("Login required! Please log in first to run the scraper.");
            } else {
                alert("Ingestion failed. Is the backend running?");
            }
        }
        setIngesting(false);
    }

    return (
        <div className="page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1>Dashboard</h1>
                <button className="btn btn-primary" onClick={handleIngest} disabled={ingesting}>
                    {ingesting ? "Scraping..." : "Run Scraper"}
                </button>
            </div>

            {overview && (
                <div className="grid-stats" style={{ marginBottom: 32 }}>
                    <div className="stat-card">
                        <h3>Total Events</h3>
                        <div className="value">{overview.total_events}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Food Events</h3>
                        <div className="value" style={{ color: "#fd79a8" }}>{overview.food_events}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Sources</h3>
                        <div className="value">{overview.total_sources}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Top City</h3>
                        <div className="value" style={{ fontSize: "1.4rem" }}>{overview.top_city}</div>
                    </div>
                </div>
            )}

            <h2 style={{ marginBottom: 16, fontSize: "1.3rem" }}>Recent Food Events</h2>
            <div className="grid-events">
                {recentEvents.map((ev) => (
                    <div key={ev.id} className="glass-card">
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                            {ev.food_score > 0 && <span className="badge badge-food">Food</span>}
                            <span className="badge badge-score">Score: {ev.relevance_score}</span>
                            <span className={`badge badge-${ev.event_type.toLowerCase()}`}>{ev.event_type}</span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>{ev.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>
                            {ev.city} &middot; {ev.source}
                        </p>
                        <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem" }}>
                            View Event &rarr;
                        </a>
                    </div>
                ))}
            </div>

            {recentEvents.length === 0 && (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 40 }}>
                    No events yet. Click &quot;Run Scraper&quot; to start.
                </p>
            )}
        </div>
    );
}
