"use client";
import { useState, useEffect } from "react";
import { searchEvents } from "../../lib/api";

export default function SearchPage() {
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState({
        location: "", radius_km: 50, min_score: 0,
        source: "", event_type: "", food_only: false,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    async function handleSearch() {
        setLoading(true);
        try {
            const params = {};
            if (filters.location) params.location = filters.location;
            if (filters.radius_km) params.radius_km = filters.radius_km;
            if (filters.min_score) params.min_score = filters.min_score;
            if (filters.source) params.source = filters.source;
            if (filters.event_type) params.event_type = filters.event_type;
            if (filters.food_only) params.food_only = true;
            const res = await searchEvents(params);
            setResults(res.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div className="page">
            <h1>Search Events</h1>

            <div className="filters">
                <div className="filter-group">
                    <label>Location</label>
                    <input className="input" placeholder="e.g. Mumbai" value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
                </div>
                <div className="filter-group">
                    <label>Radius (km)</label>
                    <input className="input" type="number" value={filters.radius_km}
                        onChange={(e) => setFilters({ ...filters, radius_km: +e.target.value })}
                        style={{ width: 100 }} />
                </div>
                <div className="filter-group">
                    <label>Min Score</label>
                    <input className="input" type="number" value={filters.min_score}
                        onChange={(e) => setFilters({ ...filters, min_score: +e.target.value })}
                        style={{ width: 80 }} />
                </div>
                <div className="filter-group">
                    <label>Source</label>
                    <select className="input" value={filters.source}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        style={{ width: 140 }}>
                        <option value="">All</option>
                        <option value="devfolio">Devfolio</option>
                        <option value="unstop">Unstop</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Type</label>
                    <select className="input" value={filters.event_type}
                        onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
                        style={{ width: 120 }}>
                        <option value="">All</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>&nbsp;</label>
                    <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                        <input type="checkbox" checked={filters.food_only}
                            onChange={(e) => setFilters({ ...filters, food_only: e.target.checked })} />
                        Food Only
                    </label>
                </div>
                <div className="filter-group">
                    <label>&nbsp;</label>
                    <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>

            <div className="grid-events">
                {results.map((ev) => (
                    <div key={ev.id} className="glass-card">
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                            {ev.food_score > 0 && <span className="badge badge-food">Food</span>}
                            <span className="badge badge-score">Score: {ev.relevance_score}</span>
                            <span className={`badge badge-${ev.event_type.toLowerCase()}`}>{ev.event_type}</span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>{ev.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>
                            {ev.city} &middot; {ev.source}
                        </p>
                        {ev.keywords?.length > 0 && (
                            <p style={{ color: "var(--food-badge)", fontSize: "0.8rem", marginBottom: 8 }}>
                                {ev.keywords.join(", ")}
                            </p>
                        )}
                        <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem" }}>
                            View Event &rarr;
                        </a>
                    </div>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 40 }}>
                    Use the filters above and click Search.
                </p>
            )}
        </div>
    );
}
