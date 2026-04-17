"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Receipt,
  ForkKnife,
  ChartBar,
  Gear,
  CaretDoubleLeft,
  CaretDoubleRight,
  List,
  Sun,
  Moon,
  SignOut,
  ShieldCheck,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const NAV = [
  { href: "/dashboard",    label: "Dashboard", Icon: SquaresFour, roles: ["admin", "manager"], color: "#F26A21" },
  { href: "/billing",      label: "Billing",   Icon: Receipt,                                  color: "#4CAF50" },
  { href: "/menu",         label: "Menu",      Icon: ForkKnife,   roles: ["admin", "manager"], color: "#0891B2" },
  { href: "/reports",      label: "Reports",   Icon: ChartBar,    roles: ["admin", "manager"], color: "#D97706" },
  { href: "/settings",     label: "Settings",  Icon: Gear,        roles: ["admin"],            color: "#64748B" },
];

const DRAWER_NAV = [
  { href: "/dashboard",    label: "Dashboard", Icon: SquaresFour, roles: ["admin", "manager"], color: "#F26A21" },
  { href: "/billing",      label: "Billing",   Icon: Receipt,                                  color: "#4CAF50" },
  { href: "/menu",         label: "Menu",      Icon: ForkKnife,   roles: ["admin", "manager"], color: "#0891B2" },
  { href: "/menu/ai-upload", label: "AI Upload", Icon: Sparkle,  roles: ["admin"],             color: "#7C3AED" },
  { href: "/reports",      label: "Reports",   Icon: ChartBar,    roles: ["admin", "manager"], color: "#D97706" },
  { href: "/settings",     label: "Settings",  Icon: Gear,        roles: ["admin"],            color: "#64748B" },
];

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [ripple, setRipple] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const rippleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarW = collapsed ? 72 : 256;

  // Live clock for drawer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  const visibleNav = NAV.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const visibleDrawerNav = DRAWER_NAV.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const activeIdx = visibleNav.findIndex(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const tap = (i: number) => {
    setRipple(i);
    if (rippleRef.current) clearTimeout(rippleRef.current);
    rippleRef.current = setTimeout(() => setRipple(null), 600);
  };

  useEffect(() => () => { if (rippleRef.current) clearTimeout(rippleRef.current); }, []);

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "manager" ? "Manager" : "Cashier";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)" }}>
        {/* Desktop sidebar */}
        <div className="appshell-sidebar">
          <Sidebar collapsed={collapsed} />
        </div>

        {/* Desktop collapse toggle */}
        <button
          className="appshell-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{ left: sidebarW - 12 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--white)";
            e.currentTarget.style.color = "var(--gray)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {collapsed ? <CaretDoubleRight size={10} weight="bold" /> : <CaretDoubleLeft size={10} weight="bold" />}
        </button>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* ── Mobile top navbar ── */}
          <div className="appshell-topbar">
            {/* Hamburger */}
            <button
              className="appshell-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <List size={22} weight="bold" />
            </button>

            {/* Logo → Dashboard */}
            <Link href="/dashboard" className="appshell-topbar-logo">
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(242,106,33,0.1)",
                border: "1.5px solid rgba(242,106,33,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Image src="/logo.png" alt="MARGROS" width={20} height={20} style={{ objectFit: "contain" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 900, color: "var(--charcoal)", letterSpacing: "0.06em", lineHeight: 1 }}>MARGROS</p>
                <p style={{ fontSize: 8, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>POS Platform</p>
              </div>
            </Link>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {user && (
                <div
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #F26A21, #FF8C4A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Desktop page title */}
          <div className="appshell-page-title">
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--charcoal)", lineHeight: 1.2 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 4, fontWeight: 500 }}>{subtitle}</p>
            )}
          </div>

          <main className="appshell-main">{children}</main>
        </div>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="appshell-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <div className={`appshell-drawer ${drawerOpen ? "appshell-drawer--open" : ""}`}>
        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px", borderBottom: "1px solid var(--border)",
        }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} onClick={() => setDrawerOpen(false)}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--primary-10)", border: "1.5px solid var(--primary-20)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Image src="/logo.png" alt="MARGROS" width={24} height={24} style={{ objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 900, color: "var(--charcoal)", letterSpacing: "0.07em", lineHeight: 1 }}>MARGROS</p>
              <p style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>POS Platform</p>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: "var(--gray-lighter)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--gray)",
            }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* User greeting */}
        {user && (
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #F26A21, #FF8C4A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16,
                flexShrink: 0,
              }}>
                {user.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--charcoal)" }}>{user.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <ShieldCheck size={11} weight="fill" color="var(--primary)" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>{roleLabel}</span>
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 800, color: "var(--charcoal)", lineHeight: 1 }}>{time}</p>
                <p style={{ fontSize: 10, color: "var(--gray)", marginTop: 2 }}>{date}</p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--gray)", fontWeight: 500 }}>
              {greeting}, <strong style={{ color: "var(--primary)" }}>{user.name.split(" ")[0]}</strong> 👋
            </p>
          </div>
        )}

        {/* Nav section label */}
        <p style={{ fontSize: 9, fontWeight: 700, color: "var(--gray)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 20px 6px", opacity: 0.6 }}>Navigation</p>

        {/* Nav items */}
        <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleDrawerNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const r = parseInt(item.color.slice(1, 3), 16);
            const g = parseInt(item.color.slice(3, 5), 16);
            const b = parseInt(item.color.slice(5, 7), 16);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10,
                  color: active ? item.color : "var(--gray)",
                  background: active ? `rgba(${r},${g},${b},0.1)` : "transparent",
                  boxShadow: active ? `inset 3px 0 0 ${item.color}` : "none",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: active ? 700 : 500,
                  textDecoration: "none", transition: "all 0.15s ease",
                }}
              >
                <item.Icon size={20} weight={active ? "fill" : "regular"} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px rgba(${r},${g},${b},0.6)` }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Utility actions */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 10px 6px" }}>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 10, width: "100%",
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--gray)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gray-lighter)"; e.currentTarget.style.color = "var(--charcoal)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gray)"; }}
          >
            <span style={{ display: "flex" }}>{dark ? <Sun size={20} weight="fill" color="#F59E0B" /> : <Moon size={20} weight="regular" />}</span>
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>

        </div>

        {/* Logout */}
        <button
          onClick={() => { setDrawerOpen(false); logout(); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 24px", width: "100%",
            background: "none", border: "none", borderTop: "1px solid var(--border)",
            cursor: "pointer", color: "var(--gray)",
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
            transition: "color 0.15s ease, background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray)"; e.currentTarget.style.background = "none"; }}
        >
          <SignOut size={17} weight="regular" />
          <span>Log out</span>
        </button>
      </div>

      {/* ── iOS-style bottom nav (mobile) ── */}
      <div className="appshell-bn-wrap">
        <nav className="appshell-bn-bar">

          {visibleNav.map((item, i) => {
            const active = i === activeIdx;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => tap(i)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 3, textDecoration: "none", position: "relative",
                  zIndex: 1, padding: "6px 2px",
                  WebkitTapHighlightColor: "transparent", userSelect: "none",
                  transform: active ? "translateY(-2px) scale(1.04)" : "scale(1)",
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {/* Ripple */}
                {ripple === i && (
                  <span style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: 60, height: 60, borderRadius: "50%",
                    background: item.color, opacity: 0,
                    transform: "translate(-50%,-50%) scale(0)",
                    animation: "appshellRipple 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
                    pointerEvents: "none", zIndex: 0,
                  }} />
                )}

                {/* Icon */}
                <span style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 26, position: "relative", zIndex: 1,
                  transform: active ? "scale(1.18)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <item.Icon
                    size={21}
                    weight={active ? "fill" : "regular"}
                    color={active ? item.color : "var(--gray)"}
                  />
                </span>

                {/* Label */}
                <span style={{
                  fontSize: 9.5, fontWeight: active ? 700 : 500,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.01em", whiteSpace: "nowrap",
                  position: "relative", zIndex: 1,
                  color: active ? item.color : "var(--gray)",
                  transform: active ? "scale(1.05)" : "scale(1)",
                  transition: "color 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        /* ── Desktop defaults ── */
        .appshell-sidebar    { display: flex; flex-shrink: 0; }
        .appshell-main       { padding: 20px 28px 28px; flex: 1; }
        .appshell-page-title { padding: 24px 28px 0; flex-shrink: 0; }
        .appshell-topbar     { display: none; }
        .appshell-bn-wrap    { display: none; }
        .appshell-backdrop   { display: none; }
        .appshell-drawer     { display: none; }

        .appshell-toggle {
          position: fixed; top: 20px;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--white); border: 1.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--gray);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          z-index: 200;
          transition: left 0.25s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          padding: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .appshell-sidebar    { display: none !important; }
          .appshell-toggle     { display: none !important; }
          .appshell-page-title { display: none; }
          .appshell-main       { padding: 14px 14px 100px !important; }

          /* Top navbar */
          .appshell-topbar {
            display: flex;
            align-items: center;
            height: 56px;
            padding: 0 14px;
            background: var(--white);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid var(--border);
            gap: 10px;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .appshell-hamburger {
            width: 36px; height: 36px; border-radius: 10px;
            background: var(--gray-lighter); border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--charcoal); flex-shrink: 0;
          }

          .appshell-topbar-logo {
            display: flex; align-items: center; gap: 8px;
            text-decoration: none; flex: 1;
          }

          .appshell-topbar-btn {
            width: 36px; height: 36px; border-radius: 10px;
            background: var(--gray-lighter); border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--gray);
          }

          /* Backdrop */
          .appshell-backdrop {
            display: block;
            position: fixed; inset: 0;
            background: rgba(15,23,42,0.45);
            backdrop-filter: blur(2px);
            z-index: 300;
            animation: backdropIn 0.2s ease forwards;
          }

          /* Drawer */
          .appshell-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: min(320px, 88vw);
            background: var(--white);
            z-index: 400;
            box-shadow: 4px 0 32px rgba(0,0,0,0.18);
            transform: translateX(-110%);
            transition: transform 0.32s cubic-bezier(0.32,0.72,0,1);
            overflow-y: auto;
            overscroll-behavior: contain;
          }

          .appshell-drawer--open {
            transform: translateX(0);
          }

          /* Bottom nav */
          .appshell-bn-wrap {
            display: block;
            position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 200;
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }

          .appshell-bn-bar {
            margin: 0 12px 10px;
            height: 64px;
            background: var(--white);
            backdrop-filter: blur(32px) saturate(180%);
            -webkit-backdrop-filter: blur(32px) saturate(180%);
            border: 1px solid var(--border);
            border-radius: 9999px;
            box-shadow:
              0 10px 40px rgba(0,0,0,0.14),
              0 2px 8px rgba(0,0,0,0.06);
            display: flex; align-items: center;
            position: relative; overflow: hidden; padding: 0 6px;
          }

        }

        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes appshellRipple {
          0%   { transform: translate(-50%,-50%) scale(0);   opacity: 0.3; }
          60%  { transform: translate(-50%,-50%) scale(1.6); opacity: 0.1; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
