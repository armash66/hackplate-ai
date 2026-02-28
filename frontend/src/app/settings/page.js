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
  const [telegram, setTelegram] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isLoaded || !isSignedIn) { setLoading(false); return; }
      try {
        const token = await getToken();
        const r = await api.get("/activity/overview", { headers: { Authorization: `Bearer ${token}` } });
        setData(r.data);
        if (r.data.saved_search) { setRadius(r.data.saved_search.radius_km); setMinScore(r.data.saved_search.min_score); }
        if (r.data.notification_preferences) setTelegram(r.data.notification_preferences.telegram_enabled);
      } catch (_) { }
      setLoading(false);
    })();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <p style={{ color: '#A3A3A3', padding: '40px 0' }}>Loading…</p>;
  if (!isSignedIn) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Sign in required</h1>
      <p style={{ color: '#737373' }}>Sign in to access your settings.</p>
    </div>
  );

  async function saveField(endpoint, body) {
    try {
      const token = await getToken();
      await api.post(endpoint, body, { headers: { Authorization: `Bearer ${token}` } });
      alert("Saved.");
    } catch (_) { alert("Failed."); }
  }

  const inputStyle = {
    padding: '9px 12px', border: '1px solid #EBEBEB', borderRadius: 7,
    fontSize: 14, color: '#1A1A1A', outline: 'none', width: '100%',
    background: '#FFF',
  };

  return (
    <>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#737373', marginBottom: 36 }}>Manage your account and preferences.</p>

      {/* Account */}
      <Section title="Account">
        <Row label="Email" value={data?.email || "—"} />
        <Row label="Member since" value={data?.joined_at ? new Date(data.joined_at).toLocaleDateString() : "—"} />
        <Row label="Saved events" value={data?.total_favorites || 0} last />
      </Section>

      {/* Search preferences */}
      <Section title="Search preferences">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#737373', marginBottom: 5, display: 'block' }}>Radius (km)</label>
            <input type="number" value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#737373', marginBottom: 5, display: 'block' }}>Min score</label>
            <input type="number" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => saveField("/activity/saved-search", {
            latitude: data?.saved_search?.latitude || 0, longitude: data?.saved_search?.longitude || 0,
            radius_km: radius, min_score: minScore, food_required: false
          })} style={{
            background: '#5B5BD6', color: '#FFF', border: 'none',
            borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Save</button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Telegram alerts</p>
            <p style={{ fontSize: 13, color: '#A3A3A3', marginTop: 2 }}>Get notified about new events.</p>
          </div>
          <div onClick={() => setTelegram(!telegram)} style={{
            width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
            background: telegram ? '#5B5BD6' : '#E5E5E5',
            transition: 'background 150ms', position: 'relative',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#FFF',
              position: 'absolute', top: 2,
              left: telegram ? 20 : 2,
              transition: 'left 150ms',
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={() => saveField("/activity/preferences", {
            frequency: "instant", telegram_enabled: telegram, email_enabled: false
          })} style={{
            background: '#5B5BD6', color: '#FFF', border: 'none',
            borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Save</button>
        </div>
      </Section>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EBEBEB' }}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: last ? 'none' : '1px solid #F5F5F4',
      fontSize: 14,
    }}>
      <span style={{ color: '#737373' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
