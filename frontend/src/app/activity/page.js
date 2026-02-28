"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "@/lib/api";

export default function ActivityPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [radius, setRadius] = useState(50);
  const [minScore, setMinScore] = useState(0);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        // Custom header approach or if the interceptor works, it attaches it. 
        // We will pass it directly just in case.
        const res = await api.get("/activity/overview", {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
        if (res.data.saved_search) {
            setRadius(res.data.saved_search.radius_km);
            setMinScore(res.data.saved_search.min_score);
        }
        if (res.data.notification_preferences) {
            setTelegramEnabled(res.data.notification_preferences.telegram_enabled);
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <div className="p-8 text-white">Loading...</div>;

  if (!isSignedIn) {
    return (
        <div className="p-8 text-center text-white">
            <h1 className="text-3xl font-bold mb-4">My Activity</h1>
            <p className="text-gray-400">Please sign in to view your SaaS profile and saved configurations.</p>
        </div>
    );
  }

  const handleUpdateSearch = async () => {
    try {
        const token = await getToken();
        await api.post("/activity/saved-search", {
            latitude: data?.saved_search?.latitude || 0.0, // Should be implemented with a real map/geocoder later
            longitude: data?.saved_search?.longitude || 0.0,
            radius_km: radius,
            min_score: minScore,
            food_required: false
        }, { headers: { Authorization: `Bearer ${token}` } });
        alert("Saved search updated!");
    } catch (e) {
        console.error(e);
        alert("Failed to update saved search.");
    }
  };

  const handleUpdatePrefs = async () => {
      try {
          const token = await getToken();
          await api.post("/activity/preferences", {
              frequency: "instant",
              telegram_enabled: telegramEnabled,
              email_enabled: false
          }, { headers: { Authorization: `Bearer ${token}` } });
          alert("Preferences updated!");
      } catch (e) {
          console.error(e);
          alert("Failed to update preferences.");
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">My SaaS Activity</h1>
        <p className="text-gray-400">Manage your personalized discovery radar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
              <div className="space-y-2 text-gray-300">
                  <p><span className="text-gray-500">Email:</span> {data?.email || "N/A"}</p>
                  <p><span className="text-gray-500">Joined:</span> {new Date(data?.joined_at).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Favorites:</span> {data?.total_favorites} events</p>
              </div>
          </div>

          {/* Saved Search Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Location & Radar Radar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Search Radius (km)</label>
                      <input 
                        type="number" 
                        value={radius} 
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Minimum Score</label>
                      <input 
                        type="number" 
                        value={minScore} 
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      />
                  </div>
              </div>
              <button 
                onClick={handleUpdateSearch}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Save Radar Configuration
              </button>
          </div>
          
          {/* Notifications Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl col-span-1 md:col-span-3">
              <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
              
              <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div>
                      <h3 className="font-medium text-white">Telegram Alerts</h3>
                      <p className="text-sm text-gray-400">Receive instant matches via Telegram Bot.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
              </div>

               <button 
                onClick={handleUpdatePrefs}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Save Preference Toggles
              </button>
          </div>
      </div>
    </div>
  );
}
