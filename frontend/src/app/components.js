"use client";
import { usePathname } from "next/navigation";

const titles = {
    "/": "Dashboard",
    "/search": "Events",
    "/map": "Map",
    "/favorites": "Saved",
    "/settings": "Settings",
};

export function TopBar() {
    const pathname = usePathname();
    const title = titles[pathname] || "Dashboard";

    return (
        <div className="topbar">
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{title}</span>
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Search…"
                    className="field"
                    style={{ width: '220px', fontSize: '13px', padding: '6px 12px' }}
                />
                <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#E5E7EB', flexShrink: 0
                }} />
            </div>
        </div>
    );
}
