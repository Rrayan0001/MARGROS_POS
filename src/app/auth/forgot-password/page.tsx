"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { ArrowLeft, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";

function ForgotPasswordContent() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast("Please enter your email", "error"); return; }
    
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    
    if (result.success) {
      setSubmitted(true);
      toast("Reset link sent to your email", "success");
    } else {
      toast(result.error || "Failed to send reset link", "error");
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-wordmark">
            <div className="auth-mark">M</div>
            <div>
              <p className="auth-brand">MARGROS</p>
              <p className="auth-brand-sub">Account Recovery</p>
            </div>
          </div>

          <div className="auth-hero">
            <p className="eyebrow" style={{ color: "rgba(250,250,250,0.4)", marginBottom: 24 }}>Password Recovery</p>
            <h1 className="h1" style={{ color: "#fff", fontSize: 56, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              Don't<br />
              <em style={{ fontStyle: "italic", color: "rgba(250,250,250,0.5)" }}>worry about</em><br />
              forgetting.
            </h1>
          </div>
        </div>
        <div className="auth-bg-letter">?</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13, marginBottom: 32 }} className="hover-underline">
            <ArrowLeft size={16} /> Back to login
          </Link>

          {submitted ? (
            <div style={{ textAlign: "center", animation: "slideUp 0.4s ease" }}>
              <div style={{ width: 64, height: 64, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={32} weight="fill" />
              </div>
              <h2 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 12 }}>Check your inbox.</h2>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                We've sent a password reset link to <strong style={{ color: "var(--ink)" }}>{email}</strong>. Please follow the instructions in the email.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn btn-outline w-full">
                Didn't get the email? Try again
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 36 }}>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Forgot Password</p>
                <h2 className="h2" style={{ letterSpacing: "-0.02em", fontWeight: 600 }}>Reset your password.</h2>
                <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div style={{ position: "relative" }}>
                    <EnvelopeSimple size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="you@margros.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: 44 }}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="loader" /> Sending…
                    </span>
                  ) : "Send Reset Link →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .auth-left { background: var(--ink); position: relative; overflow: hidden; padding: 48px; display: flex; flex-direction: column; }
        .auth-left-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
        .auth-wordmark { display: flex; align-items: center; gap: 12px; margin-bottom: auto; padding-bottom: 48px; }
        .auth-mark { width: 32px; height: 32px; border: 1.5px solid rgba(250,250,250,0.25); display: grid; place-items: center; font-family: var(--mono); font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.02em; }
        .auth-brand { font-family: var(--mono); font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.2em; line-height: 1; }
        .auth-brand-sub { font-family: var(--mono); font-size: 9px; color: rgba(250,250,250,0.35); letter-spacing: 0.18em; text-transform: uppercase; margin-top: 3px; }
        .auth-hero { padding: 60px 0 48px; }
        .auth-bg-letter { position: absolute; bottom: -80px; right: -40px; font-family: var(--sans); font-size: 400px; font-weight: 700; color: rgba(255,255,255,0.025); line-height: 1; user-select: none; pointer-events: none; letter-spacing: -0.05em; z-index: 1; }
        .auth-right { background: var(--bg-alt); display: flex; align-items: center; justify-content: center; padding: 48px; }
        .auth-form-wrap { width: 100%; max-width: 380px; display: flex; flex-direction: column; min-height: 480px; }
        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 32px 20px; }
        }
      `}</style>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ForgotPasswordContent />
      </ToastProvider>
    </AuthProvider>
  );
}
