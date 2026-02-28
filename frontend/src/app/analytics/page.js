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
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                        borderColor: "#6366F1",
                        borderWidth: 1,
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: "#F3F4F6", font: { family: "'Inter', sans-serif" } } },
                    },
                    scales: {
                        x: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
                        y: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
                    },
                },
            });
        });
    }, [trends]);

    return (
        <div className="page h-full relative" style={{ overflowY: 'auto' }}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Analytics</h1>
                <p className="text-[#9CA3AF] mt-1 text-sm font-medium">Platform-wide ingestion and event metrics.</p>
            </div>

            {overview && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                            <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.total_events}</div>
                            <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Total Events</h3>
                        </div>
                        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                            <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.food_events}</div>
                            <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span> Food Events
                            </h3>
                        </div>
                        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                            <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight">{overview.total_sources}</div>
                            <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Sources</h3>
                        </div>
                        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
                            <div className="text-3xl font-bold text-[#F3F4F6] tracking-tight truncate">{overview.top_city}</div>
                            <h3 className="text-xs font-semibold text-[#9CA3AF] mt-1">Top City</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {overview.events_by_source && Object.keys(overview.events_by_source).length > 0 && (
                            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl shadow-sm h-fit">
                                <div className="p-5 border-b border-[#1F2937] bg-[#111827] rounded-t-2xl">
                                    <h3 className="font-semibold text-sm text-[#F3F4F6] relative z-10">Events by Source</h3>
                                </div>
                                <div className="p-6">
                                    {Object.entries(overview.events_by_source).map(([src, count], index) => {
                                        const colors = ['bg-[#6366F1]', 'bg-[#F59E0B]', 'bg-[#10B981]', 'bg-[#EF4444]'];
                                        const color = colors[index % colors.length];
                                        return (
                                            <div key={src} className="flex items-center gap-3 mb-4 last:mb-0">
                                                <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
                                                <div className="flex-1 text-sm font-medium text-[#9CA3AF] capitalize tracking-wide">{src}</div>
                                                <div className="text-sm font-bold text-[#F3F4F6]">{count}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl shadow-sm p-6 lg:col-span-2 flex flex-col min-h-[350px]">
                            <h3 className="font-semibold text-[#F3F4F6] mb-6 text-sm">Events Per Day</h3>
                            <div className="relative flex-1 w-full min-h-[250px]">
                                <canvas ref={chartRef} className="absolute inset-0 w-full h-full" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
