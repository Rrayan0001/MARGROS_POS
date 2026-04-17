"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EnvelopeSimple, LockSimple, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) router.push("/dashboard");
    else setError(result.error ?? "Invalid email or password.");
  };

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <Image src="/logo.png" alt="MARGROS POS" width={90} height={90} style={{ objectFit: "contain" }} />
          <h2 className="auth-brand-name">MARGROS POS</h2>
          <p className="auth-brand-tagline">Smart Billing for Smart Restaurants</p>
          <div className="auth-brand-features">
            {[
              { icon: "⚡", text: "Instant order processing" },
              { icon: "📊", text: "Real-time analytics" },
              { icon: "🤖", text: "AI-powered menu upload" },
              { icon: "🔒", text: "Secure & reliable" },
            ].map((f) => (
              <div key={f.text} className="auth-feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-brand-orb" />
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1 className="auth-title">Welcome back 👋</h1>
            <p className="auth-subtitle">Sign in to your MARGROS POS account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <EnvelopeSimple size={16} weight="regular" className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@margros.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Password</label>
                <a href="#" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div className="form-input-icon" style={{ position: "relative" }}>
                <LockSimple size={16} weight="regular" className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray)", padding: 2 }}
                >
                  {showPass ? <EyeSlash size={16} weight="regular" /> : <Eye size={16} weight="regular" />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="loader" />Signing in…</>
              ) : (
                <><span style={{ fontWeight: 700 }}>Sign In</span> <ArrowRight size={16} weight="bold" /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Get started free
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; display: grid; grid-template-columns: 45% 55%; }
        .auth-brand { background: linear-gradient(135deg, #0D1117 0%, #1A1A2E 60%, #16213E 100%); padding: 60px 48px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .auth-brand-orb { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(242,106,33,0.1); filter: blur(80px); bottom: -100px; right: -100px; animation: float 6s ease-in-out infinite; }
        .auth-brand-content { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.7s ease both; }
        .auth-brand-name { font-family: var(--font-heading); font-size: 32px; font-weight: 900; color: white; letter-spacing: 0.04em; }
        .auth-brand-tagline { font-size: 16px; color: rgba(255,255,255,0.55); line-height: 1.5; }
        .auth-brand-features { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
        .auth-feature-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .auth-form-panel { display: flex; align-items: center; justify-content: center; padding: 40px 32px; background: var(--cream); }
        .auth-form-box { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; animation: fadeUp 0.6s ease both; }
        .auth-form-header { display: flex; flex-direction: column; gap: 6px; }
        .auth-title { font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--charcoal); }
        .auth-subtitle { font-size: 14px; color: var(--gray); }
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); padding: 12px 16px; font-size: 13px; color: #DC2626; font-weight: 500; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-switch { text-align: center; font-size: 13px; color: var(--gray); }
        .loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-brand { display: none; }
          .auth-form-panel { padding: 28px 20px; align-items: flex-start; padding-top: 40px; }
          .auth-form-box { gap: 20px; }
          .auth-title { font-size: 24px; }
        }
        @media (max-width: 400px) {
          .auth-form-panel { padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
