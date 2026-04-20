"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg || "Invalid email or password.");
    } finally {
      setLoading(false);
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
              <p className="auth-brand-sub">POS Platform · v2.6</p>
            </div>
          </div>

          <div className="auth-hero">
            <p className="eyebrow" style={{ color: "rgba(250,250,250,0.4)", marginBottom: 24 }}>Restaurant Intelligence</p>
            <h1 className="h1" style={{ color: "#fff", fontSize: 60, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              The POS<br />
              <em style={{ fontStyle: "italic", color: "rgba(250,250,250,0.5)" }}>built for</em><br />
              restaurants.
            </h1>
            <p style={{ color: "rgba(250,250,250,0.45)", fontSize: 14, marginTop: 32, lineHeight: 1.7, maxWidth: 340, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
              Fast billing · Smart analytics<br />AI-powered menu onboarding
            </p>
          </div>

          {/* Compliance */}
          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={13} color="rgba(250,250,250,0.3)" />
              <p style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "rgba(250,250,250,0.3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                SOC 2 · ISO 27001 · PCI DSS
              </p>
            </div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "rgba(250,250,250,0.18)", letterSpacing: "0.1em" }}>
              © {new Date().getFullYear()} MARGROS. All rights reserved.
            </p>
          </div>
        </div>

        {/* Big decorative M */}
        <div className="auth-bg-letter">M</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 36 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Sign In</p>
            <h2 className="h2" style={{ letterSpacing: "-0.02em", fontWeight: 600 }}>Welcome back.</h2>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              Enter your credentials to access the POS system.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className={`form-input${error ? " error" : ""}`}
                placeholder="you@margros.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className={`form-input${error ? " error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error">{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="loader" />
                  Signing in…
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" style={{ color: "var(--ink)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                Create one
              </Link>
            </p>
          </div>

          {/* Bottom strip */}
          <div style={{ marginTop: "auto", paddingTop: 40 }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center" }}>
                Secured · Encrypted · GDPR Compliant
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {

          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .auth-left {
          background: var(--ink);
          position: relative;
          overflow: hidden;
          padding: 48px;
          display: flex;
          flex-direction: column;
        }
        .auth-left-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .auth-wordmark {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: auto;
          padding-bottom: 48px;
        }
        .auth-mark {
          width: 32px; height: 32px;
          border: 1.5px solid rgba(250,250,250,0.25);
          display: grid; place-items: center;
          font-family: var(--mono); font-size: 14px; font-weight: 600;
          color: #fff; letter-spacing: -0.02em;
        }
        .auth-brand {
          font-family: var(--mono); font-size: 13px; font-weight: 800;
          color: #fff; letter-spacing: 0.2em; line-height: 1;
        }
        .auth-brand-sub {
          font-family: var(--mono); font-size: 9px; color: rgba(250,250,250,0.35);
          letter-spacing: 0.18em; text-transform: uppercase; margin-top: 3px;
        }
        .auth-hero { padding: 60px 0 48px; }
        .auth-stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: 1px solid rgba(250,250,250,0.1);
        }
        .auth-stat {
          padding: 18px;
          border-right: 1px solid rgba(250,250,250,0.1);
        }
        .auth-stat:last-child { border-right: none; }
        .auth-stat-v {
          font-family: var(--mono); font-size: 20px; font-weight: 600;
          color: #fff; letter-spacing: -0.03em; line-height: 1;
        }
        .auth-stat-l {
          font-family: var(--mono); font-size: 9.5px; color: rgba(250,250,250,0.35);
          letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px;
        }
        .auth-bg-letter {
          position: absolute;
          bottom: -80px; right: -40px;
          font-family: var(--sans); font-size: 400px; font-weight: 700;
          color: rgba(255,255,255,0.025);
          line-height: 1; user-select: none; pointer-events: none;
          letter-spacing: -0.05em; z-index: 1;
        }
        .auth-right {
          background: var(--bg-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .auth-form-wrap {
          width: 100%; max-width: 380px;
          display: flex; flex-direction: column; min-height: 520px;
        }
        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left  { display: none; }
          .auth-right { padding: 32px 20px; }
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
