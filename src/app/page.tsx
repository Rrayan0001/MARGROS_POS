"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  const [phase, setPhase] = useState(0);
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverOutline, setHoverOutline] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 350),
      setTimeout(() => setPhase(3), 550),
      setTimeout(() => setPhase(4), 750),
      setTimeout(() => setPhase(5), 950),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const fade = (active: boolean, delay = 0) => ({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0px)" : "translateY(28px)",
    transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "#0D1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "60px 24px 100px",
        fontFamily: "var(--font-poppins)",
      }}>

        {/* Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "36px",
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}>

          {/* Logo */}
          <div style={{
            ...fade(phase >= 1),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            animation: phase >= 1 ? "logoFloat 3.5s ease-in-out infinite 0.8s" : "none",
          }}>
            <Image
              src="/logo.png"
              alt="MARGROS POS"
              width={180}
              height={180}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Brand name */}
          <div style={fade(phase >= 2)}>
            <h1 style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(48px, 8vw, 72px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              margin: 0,
            }}>
              <span style={{ color: "#D94E1F" }}>M</span>ARGROS{" "}
              <span style={{ color: "#3DAB3A", letterSpacing: "0.05em" }}>POS</span>
            </h1>
          </div>

          {/* Tagline */}
          <p style={{
            ...fade(phase >= 3),
            fontSize: "clamp(15px, 2.5vw, 18px)",
            color: "rgba(255,255,255,0.45)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            margin: "-16px 0 0",
          }}>
            Smart Billing for Smart Restaurants
          </p>

          {/* CTA Buttons */}
          <div style={{
            ...fade(phase >= 4),
            display: "flex",
            gap: "16px",
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            {/* Sign In */}
            <Link
              href="/auth/login"
              onMouseEnter={() => setHoverPrimary(true)}
              onMouseLeave={() => setHoverPrimary(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 40px",
                background: hoverPrimary ? "#bf4219" : "#D94E1F",
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "var(--font-poppins)",
                textDecoration: "none",
                border: "none",
                letterSpacing: "0.02em",
                cursor: "pointer",
                transform: hoverPrimary ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Get Started Free */}
            <Link
              href="/auth/signup"
              onMouseEnter={() => setHoverOutline(true)}
              onMouseLeave={() => setHoverOutline(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 40px",
                background: hoverOutline ? "rgba(255,255,255,0.08)" : "transparent",
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: "var(--font-poppins)",
                textDecoration: "none",
                border: `2px solid ${hoverOutline ? "#3DAB3A" : "rgba(61,171,58,0.5)"}`,
                letterSpacing: "0.02em",
                cursor: "pointer",
                transform: hoverOutline ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.2s ease",
              }}
            >
              Get Started Free
            </Link>
          </div>



        </div>

        {/* Footer */}
        <div style={{
          position: "absolute",
          bottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.18)",
          zIndex: 2,
          letterSpacing: "0.03em",
        }}>
          <span>© 2026 Margros Technologies</span>
          <span>•</span>
          <span>Smart. Fast. Reliable.</span>
        </div>

      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
