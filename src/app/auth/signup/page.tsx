"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Buildings, User, EnvelopeSimple, LockSimple, Eye, EyeSlash, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function SignupContent() {
  const router = useRouter();
  const { signup } = useAuth();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.restaurantName || !form.ownerName || !form.email || !form.password) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    const ok = await signup({
      restaurantName: form.restaurantName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (!ok) {
      setError("This email is already registered. Try signing in instead.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <Image src="/logo.png" alt="MARGROS POS" width={90} height={90} style={{ objectFit: "contain" }} />
          <h2 className="auth-brand-name">Join MARGROS POS</h2>
          <p className="auth-brand-tagline">Set up your restaurant in minutes</p>
          <div className="auth-brand-features">
            {["🚀 Go live in 5 minutes", "📦 Add your full menu", "💳 All payment modes", "📈 Instant analytics"].map((f) => (
              <div key={f} className="auth-feature-item"><span>{f}</span></div>
            ))}
          </div>
        </div>
        <div className="auth-brand-orb" />
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">

          {!done ? (
            <>
              <div className="auth-form-header">
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Tell us about your restaurant</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Restaurant Name</label>
                  <div className="form-input-icon">
                    <Buildings size={16} weight="regular" className="input-icon" />
                    <input id="signup-restaurant" className="form-input" placeholder="e.g. Margros Kitchen" value={form.restaurantName} onChange={(e) => update("restaurantName", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <div className="form-input-icon">
                    <User size={16} weight="regular" className="input-icon" />
                    <input id="signup-owner" className="form-input" placeholder="Your full name" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-icon">
                    <EnvelopeSimple size={16} weight="regular" className="input-icon" />
                    <input id="signup-email" type="email" className="form-input" placeholder="you@restaurant.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-icon" style={{ position: "relative" }}>
                    <LockSimple size={16} weight="regular" className="input-icon" />
                    <input id="signup-password" type={showPass ? "text" : "password"} className="form-input" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray)", padding: 2 }}>
                      {showPass ? <EyeSlash size={16} weight="regular" /> : <Eye size={16} weight="regular" />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="form-input-icon" style={{ position: "relative" }}>
                    <LockSimple size={16} weight="regular" className="input-icon" />
                    <input id="signup-confirm-password" type={showConfirm ? "text" : "password"} className="form-input" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray)", padding: 2 }}>
                      {showConfirm ? <EyeSlash size={16} weight="regular" /> : <Eye size={16} weight="regular" />}
                    </button>
                  </div>
                </div>

                <button id="signup-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? (
                    <><span className="loader" />Creating account…</>
                  ) : (
                    <>Create Account <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{" "}
                <Link href="/auth/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(76,175,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={44} weight="fill" color="#4CAF50" />
              </div>
              <h1 className="auth-title">You&apos;re all set! 🎉</h1>
              <p className="auth-subtitle">Welcome to MARGROS POS, {form.ownerName}!<br />Redirecting to your dashboard…</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; display: grid; grid-template-columns: 45% 55%; }
        .auth-brand { background: linear-gradient(135deg, #0D1117 0%, #1A1A2E 60%, #16213E 100%); padding: 60px 48px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .auth-brand-orb { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(76,175,80,0.08); filter: blur(80px); bottom: -100px; right: -100px; }
        .auth-brand-content { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.7s ease both; }
        .auth-brand-name { font-family: var(--font-heading); font-size: 32px; font-weight: 900; color: white; letter-spacing: 0.04em; }
        .auth-brand-tagline { font-size: 16px; color: rgba(255,255,255,0.55); }
        .auth-brand-features { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
        .auth-feature-item { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .auth-form-panel { display: flex; align-items: center; justify-content: center; padding: 40px 32px; background: var(--cream); overflow-y: auto; }
        .auth-form-box { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 22px; animation: fadeUp 0.6s ease both; }
        .auth-form-header { display: flex; flex-direction: column; gap: 6px; }
        .auth-title { font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--charcoal); }
        .auth-subtitle { font-size: 14px; color: var(--gray); line-height: 1.6; }
        .auth-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); padding: 12px 16px; font-size: 13px; color: #DC2626; font-weight: 500; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-switch { text-align: center; font-size: 13px; color: var(--gray); }
        .loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-brand { display: none; }
          .auth-form-panel { padding: 28px 20px; align-items: flex-start; padding-top: 40px; }
          .auth-form-box { gap: 18px; }
          .auth-title { font-size: 22px; }
        }
        @media (max-width: 400px) {
          .auth-form-panel { padding: 20px 14px; }
        }
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupContent />
    </AuthProvider>
  );
}
