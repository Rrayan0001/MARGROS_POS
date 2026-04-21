"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Lock, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";

function UpdatePasswordContent() {
  const { toast } = useToast();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (errorCode) {
      setError(errorDesc?.replace(/\+/g, " ") ?? "Invalid or expired link");
      return;
    }
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    // Set the session so Supabase client is authenticated
    supabase.auth.setSession({ access_token: token, refresh_token: refreshToken ?? "" })
      .then(({ error }) => {
        if (error) setError("Session expired. Please request a new reset link.");
        else setAccessToken(token);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    if (password !== confirm) { toast("Passwords do not match", "error"); return; }
    if (!accessToken) { toast("Invalid session", "error"); return; }

    setLoading(true);
    // Update in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setLoading(false);
      toast(authError.message || "Failed to update password", "error");
      return;
    }

    // Sync password_hash in our users table
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, accessToken }),
    });
    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      toast(json.error || "Failed to sync password", "error");
    } else {
      setDone(true);
      toast("Password updated successfully", "success");
      setTimeout(() => router.push("/auth/login"), 2500);
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
            <p className="eyebrow" style={{ color: "rgba(250,250,250,0.4)", marginBottom: 24 }}>New Password</p>
            <h1 className="h1" style={{ color: "#fff", fontSize: 56, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              Almost<br />
              <em style={{ fontStyle: "italic", color: "rgba(250,250,250,0.5)" }}>back in</em><br />
              business.
            </h1>
          </div>
        </div>
        <div className="auth-bg-letter">✓</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13, marginBottom: 32 }} className="hover-underline">
            <ArrowLeft size={16} /> Back to login
          </Link>

          {error ? (
            <div style={{ textAlign: "center" }}>
              <h2 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 12 }}>Link expired.</h2>
              <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>{error}</p>
              <Link href="/auth/forgot-password" className="btn btn-primary btn-lg" style={{ display: "block", textAlign: "center" }}>
                Request a new link →
              </Link>
            </div>
          ) : done ? (
            <div style={{ textAlign: "center", animation: "slideUp 0.4s ease" }}>
              <div style={{ width: 64, height: 64, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={32} weight="fill" />
              </div>
              <h2 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 12 }}>Password updated.</h2>
              <p className="muted" style={{ fontSize: 14 }}>Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 36 }}>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Set New Password</p>
                <h2 className="h2" style={{ letterSpacing: "-0.02em", fontWeight: 600 }}>Choose a new password.</h2>
                <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                  Must be at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}>
                      {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm" className="form-label">Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      className="form-input"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}>
                      {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading || !accessToken}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="loader" /> Updating…
                    </span>
                  ) : "Update Password →"}
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

export default function UpdatePasswordPage() {
  return (
    <AuthProvider>
      <ToastProvider>
        <UpdatePasswordContent />
      </ToastProvider>
    </AuthProvider>
  );
}
