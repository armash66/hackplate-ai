"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../lib/api";

export default function SettingsPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(50);
  const [minScore, setMinScore] = useState(0);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isLoaded || !isSignedIn) { setLoading(false); return; }
      try {
        const token = await getToken();
        const res = await api.get("/activity/overview", { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
        if (res.data.saved_search) { setRadius(res.data.saved_search.radius_km); setMinScore(res.data.saved_search.min_score); }
        if (res.data.notification_preferences) { setTelegramEnabled(res.data.notification_preferences.telegram_enabled); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <div className="text-[#9CA3AF] py-12">Loading…</div>;
  if (!isSignedIn) return (
    <div className="py-16 text-center">
      <h1 className="mb-2">Sign in required</h1>
      <p className="text-[15px] text-[#6B7280]">Please sign in to manage your settings.</p>
    </div>
  );

  const handleUpdateSearch = async () => {
    try {
      const token = await getToken();
      await api.post("/activity/saved-search", {
        latitude: data?.saved_search?.latitude || 0, longitude: data?.saved_search?.longitude || 0,
        radius_km: radius, min_score: minScore, food_required: false
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Settings saved.");
    } catch (e) { alert("Failed to save."); }
  };

  const handleUpdatePrefs = async () => {
    try {
      const token = await getToken();
      await api.post("/activity/preferences", {
        frequency: "instant", telegram_enabled: telegramEnabled, email_enabled: false
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Preferences saved.");
    } catch (e) { alert("Failed to save."); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1">Settings</h1>
        <p className="text-[15px] text-[#6B7280]">Manage your search preferences and notifications.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="surface rounded-lg p-5">
          <h2 className="text-[15px] font-semibold mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">Email</span>
              <span className="font-medium">{data?.email || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">Joined</span>
              <span className="font-medium">{data?.joined_at ? new Date(data.joined_at).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B7280]">Saved events</span>
              <span className="font-medium">{data?.total_favorites || 0}</span>
            </div>
          </div>
        </div>

        {/* Search scope */}
        <div className="surface rounded-lg p-5">
          <h2 className="text-[15px] font-semibold mb-4">Search scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Radius (km)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="5" max="200" step="5" value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]" />
                <span className="text-sm font-medium w-12 text-right">{radius}</span>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Min confidence score</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]" />
                <span className="text-sm font-medium w-12 text-right">{minScore}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-[#F3F4F6]">
            <button className="btn btn-primary" onClick={handleUpdateSearch}>Save changes</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="surface rounded-lg p-5">
          <h2 className="text-[15px] font-semibold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Telegram alerts</p>
              <p className="text-[13px] text-[#9CA3AF]">Get notified about new events via Telegram.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)} />
              <div className="w-9 h-5 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4F46E5]"></div>
            </label>
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-[#F3F4F6]">
            <button className="btn btn-primary" onClick={handleUpdatePrefs}>Save preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
}
