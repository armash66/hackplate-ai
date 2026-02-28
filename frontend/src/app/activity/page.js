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
    <div className="page">
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My SaaS Activity</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your personalized discovery radar.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Identity Card */}
          <div className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-primary)' }}>
                  <p><strong style={{ color: 'var(--accent)', marginRight: 8 }}>Email:</strong> {data?.email || "N/A"}</p>
                  <p><strong style={{ color: 'var(--accent)', marginRight: 8 }}>Joined:</strong> {new Date(data?.joined_at).toLocaleDateString()}</p>
                  <p><strong style={{ color: 'var(--accent)', marginRight: 8 }}>Favorites:</strong> {data?.total_favorites} events</p>
              </div>
          </div>

          {/* Saved Search Card */}
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Location & Radar Setup</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  <div>
                      <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Search Radius (km)</label>
                      <input 
                        type="number" 
                        value={radius} 
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="search-input"
                        style={{ width: '100%' }}
                      />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Minimum Score Threshold</label>
                      <input 
                        type="number" 
                        value={minScore} 
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="search-input"
                        style={{ width: '100%' }}
                      />
                  </div>
              </div>
              <button 
                onClick={handleUpdateSearch}
                className="btn btn-primary"
                style={{ marginTop: 24, fontSize: '1rem', padding: '10px 20px' }}
                >
                  Save Radar Configuration
              </button>
          </div>
          
          {/* Notifications Card */}
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>Notification Preferences</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Telegram Alerts</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Receive instant radar matches via Telegram Bot.</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={telegramEnabled} onChange={(e) => setTelegramEnabled(e.target.checked)} />
                    <span style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: telegramEnabled ? 'var(--accent)' : 'var(--bg-card)', 
                        transition: '.4s', borderRadius: 24, border: '2px solid var(--border)' 
                    }}>
                        <span style={{ 
                            position: 'absolute', content: '""', height: 16, width: 16, left: telegramEnabled ? 22 : 2, bottom: 2, 
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                        }} />
                    </span>
                  </label>
              </div>

               <button 
                onClick={handleUpdatePrefs}
                className="btn btn-primary"
                style={{ marginTop: 24, background: '#20bf6b', borderColor: '#20bf6b' }}
                >
                  Save Preference Toggles
              </button>
          </div>
      </div>
    </div>
  );
}
