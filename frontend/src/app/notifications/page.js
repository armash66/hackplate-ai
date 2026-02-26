"use client";
import { useEffect, useState } from "react";
import { getRules, createRule, deleteRule } from "../../lib/api";

export default function NotificationsPage() {
    const [mounted, setMounted] = useState(false);
    const [rules, setRules] = useState([]);
    const [form, setForm] = useState({
        location: "", radius_km: 50, min_score: 3,
        food_required: true, channel: "telegram",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadRules();
    }, []);

    if (!mounted) return null;

    async function loadRules() {
        try {
            setRules((await getRules()).data);
            setError("");
        }
        catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Login required to manage alert rules.");
            } else {
                setError("Failed to load rules. Please try again.");
            }
        }
    }

    async function handleCreate() {
        if (!form.location) return;
        if (form.radius_km <= 0 || form.min_score < 0) {
            setError("Radius must be > 0 and Min Score must be >= 0.");
            return;
        }
        if (loading) return;

        setLoading(true);
        setError("");
        try {
            await createRule(form);
            setForm({ location: "", radius_km: 50, min_score: 3, food_required: true, channel: "telegram" });
            loadRules();
        } catch (e) {
            if (e.response && e.response.status === 401) {
                setError("Failed to create rule. Are you logged in?");
            } else {
                setError("An error occurred creating the rule.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (loading) return;
        setLoading(true);
        setError("");
        try {
            await deleteRule(id);
            loadRules();
        } catch (e) {
            setError("Failed to delete the rule.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <h1>Notification Rules</h1>
            {error && <p style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</p>}

            <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Create Alert Rule</h3>
                <div className="filters">
                    <div className="filter-group">
                        <label>Location</label>
                        <input className="input" placeholder="e.g. Mumbai" value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="filter-group">
                        <label>Radius (km)</label>
                        <input className="input" type="number" value={form.radius_km}
                            onChange={(e) => setForm({ ...form, radius_km: +e.target.value })}
                            style={{ width: 100 }} />
                    </div>
                    <div className="filter-group">
                        <label>Min Score</label>
                        <input className="input" type="number" value={form.min_score}
                            onChange={(e) => setForm({ ...form, min_score: +e.target.value })}
                            style={{ width: 80 }} />
                    </div>
                    <div className="filter-group">
                        <label>Channel</label>
                        <select className="input" value={form.channel}
                            onChange={(e) => setForm({ ...form, channel: e.target.value })}
                            style={{ width: 130 }}>
                            <option value="telegram">Telegram</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>&nbsp;</label>
                        <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                            <input type="checkbox" checked={form.food_required}
                                onChange={(e) => setForm({ ...form, food_required: e.target.checked })} />
                            Food Required
                        </label>
                    </div>
                    <div className="filter-group">
                        <label>&nbsp;</label>
                        <button className="btn btn-primary" onClick={handleCreate}>Create Rule</button>
                    </div>
                </div>
            </div>

            {rules.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {rules.map((r) => (
                        <div key={r.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <strong>{r.location}</strong> &middot; {r.radius_km}km &middot; min score {r.min_score}
                                &middot; {r.channel} {r.food_required ? " &middot; food only" : ""}
                            </div>
                            <button className="btn btn-danger" onClick={() => handleDelete(r.id)} style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>No alert rules yet.</p>
            )}
        </div>
    );
}
