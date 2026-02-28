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

  if (!isLoaded || loading) return <div style={{ padding: 48, color: '#9CA3AF' }}>Loading…</div>;
  if (!isSignedIn) return (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <h1>Sign in required</h1>
      <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>Please sign in to manage settings.</p>
    </div>
  );

  const save = async (endpoint, body) => {
    try {
      const token = await getToken();
      await api.post(endpoint, body, { headers: { Authorization: `Bearer ${token}` } });
      alert("Saved.");
    } catch (e) { alert("Failed to save."); }
  };

  const sectionStyle = {
    marginBottom: 32,
  };
  const sectionTitle = {
    fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20,
    paddingBottom: 12, borderBottom: '1px solid #E5E7EB'
  };
  const rowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #F3F4F6'
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1>Settings</h1>
        <p style={{ color: '#6B7280', fontSize: 15, marginTop: 4 }}>Manage your account and preferences.</p>
      </div>

      {/* Account */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Account</div>
        <div style={rowStyle}>
          <span style={{ fontSize: 14, color: '#6B7280' }}>Email</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{data?.email || "—"}</span>
        </div>
        <div style={rowStyle}>
          <span style={{ fontSize: 14, color: '#6B7280' }}>Member since</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{data?.joined_at ? new Date(data.joined_at).toLocaleDateString() : "—"}</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ fontSize: 14, color: '#6B7280' }}>Saved events</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{data?.total_favorites || 0}</span>
        </div>
      </div>

      {/* Preferences */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Preferences</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Search radius (km)</label>
            <input className="field" type="number" value={radius} onChange={e => setRadius(parseInt(e.target.value))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Min confidence score</label>
            <input className="field" type="number" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => save("/activity/saved-search", {
            latitude: data?.saved_search?.latitude || 0, longitude: data?.saved_search?.longitude || 0,
            radius_km: radius, min_score: minScore, food_required: false
          })}>Save changes</button>
        </div>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Notifications</div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Telegram alerts</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Get notified about new events via Telegram.</div>
          </div>
          <div
            className={`toggle-track ${telegramEnabled ? 'active' : ''}`}
            onClick={() => setTelegramEnabled(!telegramEnabled)}
          >
            <div className="toggle-knob" />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => save("/activity/preferences", {
            frequency: "instant", telegram_enabled: telegramEnabled, email_enabled: false
          })}>Save preferences</button>
        </div>
      </div>
    </div>
  );
}
