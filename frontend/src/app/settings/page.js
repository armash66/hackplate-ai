"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../lib/api";

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
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent), var(--accent-hover))', WebkitBackgroundClip: 'text', color: 'transparent' }}>My SaaS Activity</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Please sign in to view your SaaS profile and saved configurations.</p>
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
    <div className="page h-full relative" style={{ overflowY: 'auto' }}>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#F3F4F6] tracking-tight m-0">Settings</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm font-medium">Manage your personalized discovery radar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Identity Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <h2 className="text-lg font-bold text-[#F3F4F6] border-b border-[#1F2937] pb-4 mb-6">Profile Overview</h2>
              <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-[#1F2937]/50">
                      <span className="text-[#9CA3AF] font-medium">Email Address</span>
                      <span className="text-[#F3F4F6] font-semibold">{data?.email || "Pending Sync"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1F2937]/50">
                      <span className="text-[#9CA3AF] font-medium">Joined Plateau</span>
                      <span className="text-[#F3F4F6] font-semibold">{data?.joined_at ? new Date(data?.joined_at).toLocaleDateString() : "Just Now"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                      <span className="text-[#9CA3AF] font-medium">Opportunities Saved</span>
                      <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></span>
                          <span className="text-[#F3F4F6] font-bold">{data?.total_favorites || 0}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <h2 className="text-lg font-bold text-[#F3F4F6] border-b border-[#1F2937] pb-4 mb-6">Alert Configurations</h2>
              
              <div className="flex justify-between items-center bg-[#0B0F1A] border border-[#1F2937] p-5 rounded-xl mb-6 flex-1">
                  <div>
                      <h3 className="font-semibold text-[#F3F4F6] mb-1">Telegram Connect</h3>
                      <p className="text-xs text-[#9CA3AF]">Receive instant local drops via Telegram Bot.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#F3F4F6] after:border-[#1F2937] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
              </div>

               <button 
                onClick={handleUpdatePrefs}
                className="w-full bg-[#111827] hover:bg-[#1F2937] text-[#F3F4F6] font-medium py-3 px-6 rounded-xl border border-[#1F2937] transition-all text-sm shadow-sm hover:border-[#6366F1]/50"
                >
                  Save Alert Preference
              </button>
          </div>

          {/* Saved Search Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-[#F3F4F6] border-b border-[#1F2937] pb-4 mb-6">Radar Scope</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                      <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Search Radius (km)</label>
                      <input 
                        type="number" 
                        value={radius} 
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full bg-[#0B0F1A] border border-[#1F2937] text-[#F3F4F6] text-sm rounded-xl focus:ring-[#6366F1] focus:border-[#6366F1] block p-3 px-4 shadow-inner"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-[#9CA3AF] mb-2">AI Min Confidence (0-10)</label>
                      <input 
                        type="number" 
                        value={minScore} 
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-full bg-[#0B0F1A] border border-[#1F2937] text-[#F3F4F6] text-sm rounded-xl focus:ring-[#6366F1] focus:border-[#6366F1] block p-3 px-4 shadow-inner"
                        max="10"
                        min="0"
                      />
                  </div>
              </div>
              
              <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateSearch}
                    className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium py-3 px-8 rounded-xl transition-all shadow-sm shadow-[#6366F1]/20 text-sm"
                    >
                      Update Scope
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
