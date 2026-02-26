"use client";
import { useEffect, useState, useRef } from "react";
import { getOverview, getTrends } from "../../lib/api";

export default function AnalyticsPage() {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        Promise.all([getOverview(), getTrends()])
            .then(([ov, tr]) => {
                setOverview(ov.data);
                setTrends(tr.data);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!chartRef.current || trends.length === 0) return;
        if (chartInstance.current) chartInstance.current.destroy();

        import("chart.js/auto").then((ChartModule) => {
            const Chart = ChartModule.default;
            chartInstance.current = new Chart(chartRef.current, {
                type: "bar",
                data: {
                    labels: trends.map((t) => t.date).reverse(),
                    datasets: [{
                        label: "Events Scraped",
                        data: trends.map((t) => t.count).reverse(),
                        backgroundColor: "rgba(108, 92, 231, 0.6)",
                        borderColor: "#6c5ce7",
                        borderWidth: 1,
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: "#e8e8f0" } },
                    },
                    scales: {
                        x: { ticks: { color: "#8888a0" }, grid: { color: "#1e1e30" } },
                        y: { ticks: { color: "#8888a0" }, grid: { color: "#1e1e30" } },
                    },
                },
            });
        });
    }, [trends]);

    return (
        <div className="page">
            <h1>Analytics</h1>

            {overview && (
                <>
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

                    {overview.events_by_source && Object.keys(overview.events_by_source).length > 0 && (
                        <div className="glass-card" style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 12 }}>Events by Source</h3>
                            {Object.entries(overview.events_by_source).map(([src, count]) => (
                                <div key={src} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ textTransform: "capitalize" }}>{src}</span>
                                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="glass-card">
                <h3 style={{ marginBottom: 16 }}>Events Per Day</h3>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}
