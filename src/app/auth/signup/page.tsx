"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Buildings, User, EnvelopeSimple, LockSimple, Eye, EyeSlash, CheckCircle, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function SignupContent() {
  const router = useRouter();
  const { signup, verifySignupOtp } = useAuth();
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

  // OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [done, setDone] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const update = (field: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

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
    const result = await signup({
      restaurantName: form.restaurantName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (result.otpSent) {
      setOtpStep(true);
      startResendCooldown();
    } else {
      setError(result.error ?? "This email is already registered. Try signing in instead.");
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length < 6) { setError("Enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    const result = await verifySignupOtp(form.email, token, {
      restaurantName: form.restaurantName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setError(result.error ?? "Invalid or expired code. Try again.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    await signup({
      restaurantName: form.restaurantName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    setOtp(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
    startResendCooldown();
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

          {done ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(76,175,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={44} weight="fill" color="#4CAF50" />
              </div>
              <h1 className="auth-title">You&apos;re all set! 🎉</h1>
              <p className="auth-subtitle">Welcome to MARGROS POS, {form.ownerName}!<br />Redirecting to your dashboard…</p>
            </div>

          ) : !otpStep ? (
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
                    <><span className="loader" />Sending verification…</>
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
            <>
              <div className="auth-form-header" style={{ alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <ShieldCheck size={28} weight="fill" color="var(--primary)" />
                </div>
                <h1 className="auth-title">Verify your email</h1>
                <p className="auth-subtitle">
                  We sent a 6-digit code to<br />
                  <strong style={{ color: "var(--charcoal)" }}>{form.email}</strong>
                </p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div onPaste={handleOtpPaste}>
                  <label className="form-label" style={{ marginBottom: 12, display: "block" }}>Verification Code</label>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{
                          width: 48, height: 56, textAlign: "center",
                          fontSize: 22, fontWeight: 700, fontFamily: "var(--font-heading)",
                          border: `2px solid ${digit ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: 12, outline: "none", background: "var(--white)",
                          color: "var(--charcoal)", transition: "border-color 0.15s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handleVerify}
                  disabled={loading || otp.join("").length < 6}
                >
                  {loading ? (
                    <><span className="loader" />Verifying…</>
                  ) : (
                    <><ShieldCheck size={18} weight="fill" /> Verify & Create Account</>
                  )}
                </button>

                <div style={{ background: "var(--gray-lighter)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--gray)", lineHeight: 1.6, textAlign: "center" }}>
                  📬 The code may take up to <strong>30–60 seconds</strong> to arrive. Please wait before requesting a new one or closing this page.
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    style={{ background: "none", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer", fontSize: 13, color: resendCooldown > 0 ? "var(--gray)" : "var(--primary)", fontWeight: 600 }}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>

                <button
                  onClick={() => { setOtpStep(false); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--gray)", textAlign: "center" }}
                >
                  ← Back to sign up
                </button>
              </div>
            </>
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
