"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../lib/api";

export default function SettingsPage() {
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

  if (!isLoaded || loading) return <div className="p-8 text-[#9CA3AF] animate-pulse">Synchronizing preferences...</div>;

  if (!isSignedIn) {
    return (
        <div className="py-20 flex flex-col items-center justify-center text-center">
            <h1 className="mb-4">Session Required</h1>
            <p className="text-[#9CA3AF] text-lg max-w-sm">Please authenticate to access your discovery parameters and radar scope.</p>
        </div>
    );
  }

  const handleUpdateSearch = async () => {
    try {
        const token = await getToken();
        await api.post("/activity/saved-search", {
            latitude: data?.saved_search?.latitude || 0.0,
            longitude: data?.saved_search?.longitude || 0.0,
            radius_km: radius,
            min_score: minScore,
            food_required: false
        }, { headers: { Authorization: `Bearer ${token}` } });
        alert("Radar scope updated!");
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
          alert("Preferences synchronized!");
      } catch (e) {
          console.error(e);
          alert("Failed to update preferences.");
      }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2">Settings</h1>
        <p className="text-[#9CA3AF] text-lg font-medium">Manage your personalized discovery radar and notification hooks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Identity Card */}
          <div className="premium-card flex flex-col">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#6366F1] rounded-full"></span>
                  Profile Overview
              </h2>
              <div className="flex flex-col gap-1 text-sm flex-1">
                  <div className="flex justify-between items-center py-4 border-b border-[#1F2937]">
                      <span className="text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Identity</span>
                      <span className="text-[#F3F4F6] font-medium">{data?.email || "Authenticated User"}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#1F2937]">
                      <span className="text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Since</span>
                      <span className="text-[#F3F4F6] font-medium">{data?.joined_at ? new Date(data?.joined_at).toLocaleDateString() : "Present"}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                      <span className="text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Saved Signals</span>
                      <div className="flex items-center gap-2">
                          <span className="text-[#6366F1] font-mono font-bold">{data?.total_favorites || 0}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Notifications Card */}
          <div className="premium-card flex flex-col">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#6366F1] rounded-full"></span>
                  Alert Hooks
              </h2>
              
              <div className="bg-[#0B0F1A] border border-[#1F2937] p-6 rounded-xl mb-8 flex-1 flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-[#F3F4F6] mb-1">Telegram Integration</h3>
                      <p className="text-sm text-[#6B7280]">Receive instant local drops via the HackPlate bot.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#9CA3AF] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1] peer-checked:after:bg-white"></div>
                  </label>
              </div>

               <button 
                onClick={handleUpdatePrefs}
                className="btn-premium btn-secondary w-full py-4 text-sm"
                >
                  Synchronize Alert Preferences
              </button>
          </div>

          {/* Saved Search Card */}
          <div className="premium-card lg:col-span-2">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#6366F1] rounded-full"></span>
                  Radar Scope Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">Discovery Radius</label>
                        <span className="text-[#6366F1] font-mono text-sm">{radius} KM</span>
                      </div>
                      <input 
                        type="range" 
                        min="5"
                        max="200"
                        step="5"
                        value={radius} 
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                      />
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280]">AI Confidence Threshold</label>
                        <span className="text-[#6366F1] font-mono text-sm">{minScore}/100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        value={minScore} 
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                      />
                  </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-[#1F2937]">
                  <button 
                    onClick={handleUpdateSearch}
                    className="btn-premium btn-primary px-12 py-3"
                    >
                      Update Radar Scope
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
