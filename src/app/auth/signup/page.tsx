"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
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

  const [form, setForm] = useState({ restaurantName: "", ownerName: "", email: "", password: "", confirmPassword: "" });

  const [otpStep, setOtpStep] = useState(false);
  const [done, setDone] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const update = (field: keyof typeof form, val: string) => setForm((prev) => ({ ...prev, [field]: val }));

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => { setResendCooldown((c) => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; }); }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.restaurantName || !form.ownerName || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const result = await signup({ restaurantName: form.restaurantName, ownerName: form.ownerName, email: form.email, password: form.password });
    setLoading(false);
    if (result.otpSent) { setOtpStep(true); startResendCooldown(); }
    else { setError(result.error ?? "This email is already registered. Try signing in instead."); }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length < 6) { setError("Enter the full 6-digit code."); return; }
    setError(""); setLoading(true);
    const result = await verifySignupOtp(form.email, token, { restaurantName: form.restaurantName, ownerName: form.ownerName, email: form.email, password: form.password });
    setLoading(false);
    if (result.success) { setDone(true); setTimeout(() => router.push("/dashboard"), 2000); }
    else { setError(result.error ?? "Invalid or expired code. Try again."); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return; setError(""); setLoading(true);
    await signup({ restaurantName: form.restaurantName, ownerName: form.ownerName, email: form.email, password: form.password });
    setLoading(false); setOtp(["", "", "", "", "", ""]); otpRefs.current[0]?.focus(); startResendCooldown();
  };

  // Determine step number for indicator
  const stepNum = done ? 3 : otpStep ? 2 : 1;

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-wordmark">
            <div className="auth-mark">M</div>
            <div>
              <p className="auth-brand">MARGROS</p>
              <p className="auth-brand-sub">POS Platform · v2.6</p>
            </div>
          </div>

          <div className="auth-hero">
            <p className="eyebrow" style={{ color: "rgba(250,250,250,0.4)", marginBottom: 24 }}>Restaurant Onboarding</p>
            <h1 className="h1" style={{ color: "#fff", fontSize: 56, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              Start in<br />
              <em style={{ fontStyle: "italic", color: "rgba(250,250,250,0.5)" }}>under</em><br />
              5 minutes.
            </h1>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Go live instantly", "Add your full menu", "All payment modes", "Real-time analytics"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={14} weight="fill" color="rgba(250,250,250,0.5)" />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "rgba(250,250,250,0.65)", letterSpacing: "0.04em" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={13} color="rgba(250,250,250,0.3)" />
              <p style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "rgba(250,250,250,0.3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                SOC 2 · ISO 27001 · PCI DSS
              </p>
            </div>
          </div>
        </div>
        <div className="auth-bg-letter">M</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap" style={{ minHeight: 600 }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
            {["Account", "Verify", "Done"].map((s, i) => {
              const n = i + 1;
              const active = n === stepNum;
              const complete = n < stepNum;
              return (
                <React.Fragment key={s}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: complete ? "var(--ink)" : active ? "var(--ink)" : "var(--chip)", border: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: (active || complete) ? "var(--bg)" : "var(--muted)" }}>
                      {complete ? <CheckCircle size={14} weight="fill" /> : n}
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "var(--ink)" : "var(--muted)" }}>{s}</span>
                  </div>
                  {i < 2 && <div style={{ height: 1, flex: 1, background: n < stepNum ? "var(--ink)" : "var(--line)", margin: "0 8px", marginBottom: 18 }} />}
                </React.Fragment>
              );
            })}
          </div>

          {done ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 40 }}>
              <div style={{ width: 72, height: 72, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={40} weight="fill" color="var(--ink)" />
              </div>
              <div>
                <h2 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>You&apos;re all set!</h2>
                <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7 }}>
                  Welcome to MARGROS POS, {form.ownerName}!<br />Redirecting to your dashboard…
                </p>
              </div>
            </div>

          ) : !otpStep ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Step 01 — Account</p>
                <h2 className="h2" style={{ letterSpacing: "-0.02em", fontWeight: 600 }}>Create your account.</h2>
                <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>Tell us about your restaurant.</p>
              </div>

              {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label"><Buildings size={12} /> Restaurant Name</label>
                  <input id="signup-restaurant" className="form-input" placeholder="e.g. Margros Kitchen" value={form.restaurantName} onChange={(e) => update("restaurantName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label"><User size={12} /> Owner Name</label>
                  <input id="signup-owner" className="form-input" placeholder="Your full name" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label"><EnvelopeSimple size={12} /> Email Address</label>
                  <input id="signup-email" type="email" className="form-input" placeholder="you@restaurant.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label"><LockSimple size={12} /> Password</label>
                    <div style={{ position: "relative" }}>
                      <input id="signup-password" type={showPass ? "text" : "password"} className="form-input" placeholder="Min 6 chars" value={form.password} onChange={(e) => update("password", e.target.value)} style={{ paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        {showPass ? <EyeSlash size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm</label>
                    <div style={{ position: "relative" }}>
                      <input id="signup-confirm-password" type={showConfirm ? "text" : "password"} className="form-input" placeholder="Re-enter" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} style={{ paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        {showConfirm ? <EyeSlash size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button id="signup-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", gap: 8, marginTop: 4, padding: "13px 18px" }}>
                  {loading ? <><span className="loader" /> Sending verification…</> : <>Create Account <ArrowRight size={15} weight="bold" /></>}
                </button>
              </form>

              <p style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", marginTop: 20 }}>
                Already have an account?{" "}
                <Link href="/auth/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>Sign in</Link>
              </p>
            </>

          ) : (
            <>
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <ShieldCheck size={24} weight="fill" />
                </div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Step 02 — Verify Email</p>
                <h2 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8 }}>Check your inbox.</h2>
                <p className="muted" style={{ fontSize: 13 }}>We sent a 6-digit code to <strong style={{ color: "var(--ink)" }}>{form.email}</strong></p>
              </div>

              {error && <p className="form-error" style={{ marginBottom: 12, textAlign: "center" }}>{error}</p>}

              <div onPaste={handleOtpPaste}>
                <label className="form-label" style={{ display: "block", textAlign: "center", marginBottom: 14 }}>Verification Code</label>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={(el) => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{ width: 46, height: 54, textAlign: "center", fontSize: 22, fontFamily: "var(--mono)", fontWeight: 700, border: `1.5px solid ${digit ? "var(--ink)" : "var(--line)"}`, borderRadius: "var(--radius)", outline: "none", background: "var(--bg)", color: "var(--ink)", transition: "border-color 0.15s ease" }}
                    />
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleVerify} disabled={loading || otp.join("").length < 6} style={{ width: "100%", justifyContent: "center", gap: 8, padding: "13px 18px", marginBottom: 14 }}>
                {loading ? <><span className="loader" /> Verifying…</> : <><ShieldCheck size={16} weight="fill" /> Verify & Create Account</>}
              </button>

              <div className="card card-padded" style={{ background: "var(--chip)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                  The code may take up to <strong style={{ color: "var(--ink)" }}>30–60 seconds</strong> to arrive. Please wait before requesting a new one.
                </p>
              </div>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={handleResend} disabled={resendCooldown > 0}
                  style={{ background: "none", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer", fontSize: 13, color: resendCooldown > 0 ? "var(--muted)" : "var(--ink)", fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button onClick={() => { setOtpStep(false); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>
                  ← Back to sign up
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .auth-left { background: var(--ink); position: relative; overflow: hidden; padding: 48px; display: flex; flex-direction: column; }
        .auth-left-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
        .auth-wordmark { display: flex; align-items: center; gap: 12px; margin-bottom: auto; padding-bottom: 48px; }
        .auth-mark { width: 32px; height: 32px; border: 1.5px solid rgba(250,250,250,0.25); display: grid; place-items: center; font-family: var(--mono); font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.02em; }
        .auth-brand { font-family: var(--mono); font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.2em; line-height: 1; }
        .auth-brand-sub { font-family: var(--mono); font-size: 9px; color: rgba(250,250,250,0.35); letter-spacing: 0.18em; text-transform: uppercase; margin-top: 3px; }
        .auth-hero { padding: 60px 0 40px; }
        .auth-bg-letter { position: absolute; bottom: -80px; right: -40px; font-family: var(--sans); font-size: 400px; font-weight: 700; color: rgba(255,255,255,0.025); line-height: 1; user-select: none; pointer-events: none; letter-spacing: -0.05em; z-index: 1; }
        .auth-right { background: var(--bg-alt); display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; }
        .auth-form-wrap { width: 100%; max-width: 400px; }
        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 32px 20px; }
        }
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  return <AuthProvider><SignupContent /></AuthProvider>;
}
