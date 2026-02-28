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
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent m-0">Analytics</h1>
                <p className="text-gray-400 mt-1">Platform-wide ingestion and event metrics.</p>
            </div>

            {overview && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Events</h3>
                            <div className="text-2xl font-bold text-white">{overview.total_events}</div>
                        </div>
                        <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg border-b-2 border-b-orange-500">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Events</h3>
                            <div className="text-2xl font-bold text-orange-400">{overview.food_events}</div>
                        </div>
                        <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sources</h3>
                            <div className="text-2xl font-bold text-blue-400">{overview.total_sources}</div>
                        </div>
                        <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl p-4 shadow-lg">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Top City</h3>
                            <div className="text-2xl font-bold text-purple-400 truncate">{overview.top_city}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {overview.events_by_source && Object.keys(overview.events_by_source).length > 0 && (
                            <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl shadow-lg overflow-hidden h-fit">
                                <div className="p-4 border-b border-[#1e1e30] bg-[#1a1a2e]/50">
                                    <h3 className="font-semibold text-sm text-gray-300 relative z-10 text-white">Events by Source</h3>
                                </div>
                                <div className="p-5">
                                    {Object.entries(overview.events_by_source).map(([src, count], index) => {
                                        // Simple fake colors to differentiate sources
                                        const colors = ['bg-indigo-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500'];
                                        const color = colors[index % colors.length];
                                        return (
                                            <div key={src} className="flex items-center gap-3 mb-3 last:mb-0">
                                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                                <div className="flex-1 text-sm text-gray-300 capitalize">{src}</div>
                                                <div className="text-sm font-bold text-white">{count}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-[#12121a] border border-[#1e1e30] rounded-xl shadow-lg p-5 lg:col-span-2">
                            <h3 className="font-semibold text-white mb-4">Events Per Day</h3>
                            <div className="relative h-64 w-full">
                                <canvas ref={chartRef} className="absolute inset-0 w-full h-full" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
