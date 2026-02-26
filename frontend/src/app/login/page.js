"use client";
import { useState } from "react";
import { login, register } from "../../lib/api";

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setMessage("");
        try {
            if (isRegister) {
                await register(email, password);
                setMessage("Account created! You can now login.");
                setIsRegister(false);
            } else {
                await login(email, password);
                setMessage("Logged in! Redirecting...");
                setTimeout(() => window.location.href = "/", 1000);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong");
        }
    }

    return (
        <div className="page" style={{ maxWidth: 440, marginTop: 60 }}>
            <div className="glass-card">
                <h1 style={{ fontSize: "1.5rem", marginBottom: 24, textAlign: "center" }}>
                    {isRegister ? "Create Account" : "Login"}
                </h1>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <input className="input" type="email" placeholder="Email" required
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="input" type="password" placeholder="Password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 8 }}>
                        {isRegister ? "Register" : "Login"}
                    </button>
                </form>

                {message && <p style={{ color: "var(--success)", marginTop: 12, textAlign: "center" }}>{message}</p>}
                {error && <p style={{ color: "var(--danger)", marginTop: 12, textAlign: "center" }}>{error}</p>}

                <p style={{ textAlign: "center", marginTop: 16, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {isRegister ? "Already have an account?" : "No account?"}{" "}
                    <span onClick={() => { setIsRegister(!isRegister); setError(""); setMessage(""); }}
                        style={{ color: "var(--accent)", cursor: "pointer" }}>
                        {isRegister ? "Login" : "Register"}
                    </span>
                </p>
            </div>
        </div>
    );
}
