"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
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
  { href: "/dashboard",    label: "Dashboard", Icon: SquaresFour, roles: ["admin", "manager"] },
  { href: "/billing",      label: "Billing",   Icon: Receipt },
  { href: "/menu",         label: "Menu",      Icon: ForkKnife,   roles: ["admin", "manager"] },
  { href: "/reports",      label: "Reports",   Icon: ChartBar,    roles: ["admin", "manager"] },
  { href: "/settings",     label: "Settings",  Icon: Gear,        roles: ["admin"] },
];

const DRAWER_NAV = [
  { href: "/dashboard",    label: "Dashboard", Icon: SquaresFour, roles: ["admin", "manager"] },
  { href: "/billing",      label: "Billing",   Icon: Receipt },
  { href: "/menu",         label: "Menu",      Icon: ForkKnife,   roles: ["admin", "manager"] },
  { href: "/menu/ai-upload", label: "AI Upload", Icon: Sparkle,   roles: ["admin"] },
  { href: "/reports",      label: "Reports",   Icon: ChartBar,    roles: ["admin", "manager"] },
  { href: "/settings",     label: "Settings",  Icon: Gear,        roles: ["admin"] },
];

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const rippleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarW = collapsed ? 72 : 256;

  // Live clock
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
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
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

  useEffect(() => () => { if (rippleRef.current) clearTimeout(rippleRef.current); }, []);

  const roleLabel = user?.role === "admin" ? "ADMIN" : user?.role === "manager" ? "MANAGER" : "CASHIER";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Build breadcrumb from pathname
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
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
        >
          {collapsed ? <CaretDoubleRight size={10} weight="bold" /> : <CaretDoubleLeft size={10} weight="bold" />}
        </button>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* ── Desktop Topbar ── */}
          <div className="appshell-desktop-topbar">
            <div className="breadcrumb">
              <span>MARGROS</span>
              <span className="sep">/</span>
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  {i < crumbs.length - 1
                    ? <><span>{c}</span><span className="sep">/</span></>
                    : <span className="cur">{c}</span>
                  }
                </React.Fragment>
              ))}
            </div>
            <div className="topbar-right">
            </div>
          </div>

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

            {/* Wordmark */}
            <Link href="/dashboard" className="appshell-topbar-logo">
              <div style={{
                width: 28, height: 28, border: "1.5px solid var(--ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
                letterSpacing: "-0.02em", color: "var(--ink)", position: "relative",
              }}>
                M
              </div>
              <div>
                <p style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 800, color: "var(--ink)", letterSpacing: "0.18em", lineHeight: 1 }}>MARGROS</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>POS</p>
              </div>
            </Link>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                className="icon-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{ width: 34, height: 34 }}
              >
                {dark ? <Sun size={16} weight="fill" /> : <Moon size={16} weight="regular" />}
              </button>
              {user && (
                <div
                  onClick={() => setDrawerOpen(true)}
                  className="avatar"
                  style={{ cursor: "pointer" }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Desktop page title area */}
          <div className="appshell-page-title">
            {subtitle && <div className="eyebrow" style={{ marginBottom: 8 }}>{subtitle}</div>}
            <h1 className="h2" style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
              {title}
            </h1>
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
          padding: "16px 18px", borderBottom: "1px solid var(--line)",
        }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} onClick={() => setDrawerOpen(false)}>
            <div style={{
              width: 28, height: 28, border: "1.5px solid var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
              letterSpacing: "-0.02em", color: "var(--ink)",
            }}>
              M
            </div>
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 800, color: "var(--ink)", letterSpacing: "0.18em", lineHeight: 1 }}>MARGROS</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>POS Platform</p>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="icon-btn"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* User greeting */}
        {user && (
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, flexShrink: 0 }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{user.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <ShieldCheck size={11} weight="fill" color="var(--muted)" />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.14em" }}>{roleLabel}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{time}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{date}</p>
              </div>
            </div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {greeting}, {user.name.split(" ")[0]}
            </p>
          </div>
        )}

        {/* Nav section label */}
        <p style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 20px 6px", opacity: 0.6 }}>Navigation</p>

        {/* Nav items */}
        <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleDrawerNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: "var(--radius)",
                  color: active ? "var(--bg)" : "var(--ink-2)",
                  background: active ? "var(--ink)" : "transparent",
                  fontFamily: "var(--sans)", fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none", transition: "background 120ms ease",
                }}
              >
                <item.Icon size={18} weight={active ? "fill" : "regular"} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Utility actions */}
        <div style={{ borderTop: "1px solid var(--line)", padding: "10px 10px 6px" }}>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: "var(--radius)", width: "100%",
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--muted)", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 400,
            }}
          >
            <span style={{ display: "flex" }}>
              {dark ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="regular" />}
            </span>
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => { setDrawerOpen(false); logout(); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 24px", width: "100%",
            background: "none", border: "none", borderTop: "1px solid var(--line)",
            cursor: "pointer", color: "var(--muted)",
            fontFamily: "var(--sans)", fontSize: 14, fontWeight: 400,
          }}
        >
          <SignOut size={16} weight="regular" />
          <span>Log out</span>
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="appshell-bn-wrap">
        <nav className="appshell-bn-bar">
          {visibleNav.map((item, i) => {
            const active = i === activeIdx;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 4, textDecoration: "none", position: "relative",
                  zIndex: 1, padding: "6px 2px",
                  WebkitTapHighlightColor: "transparent", userSelect: "none",
                }}
              >
                <item.Icon
                  size={21}
                  weight={active ? "fill" : "regular"}
                  color={active ? "var(--ink)" : "var(--muted)"}
                />
                <span style={{
                  fontFamily: "var(--mono)",
                  fontSize: 9, fontWeight: active ? 700 : 400,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: active ? "var(--ink)" : "var(--muted)",
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
        .appshell-main       { padding: 28px 56px 56px; flex: 1; }
        .appshell-page-title { padding: 32px 56px 0; flex-shrink: 0; }
        .appshell-topbar     { display: none; }
        .appshell-bn-wrap    { display: none; }
        .appshell-backdrop   { display: none; }
        .appshell-drawer     { display: none; }

        .appshell-desktop-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 56px;
          height: 56px;
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          background: color-mix(in srgb, var(--bg) 92%, transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10;
          flex-shrink: 0;
        }

        .appshell-toggle {
          position: fixed; top: 24px;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--bg); border: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--muted);
          z-index: 200;
          transition: left 0.25s ease;
          padding: 0;
        }
        .appshell-toggle:hover { background: var(--chip); border-color: var(--ink); color: var(--ink); }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .appshell-sidebar            { display: none !important; }
          .appshell-toggle             { display: none !important; }
          .appshell-desktop-topbar     { display: none !important; }
          .appshell-page-title         { display: none; }
          .appshell-main               { padding: 14px 16px 100px !important; }

          /* Top navbar */
          .appshell-topbar {
            display: flex;
            align-items: center;
            height: 52px;
            padding: 0 14px;
            background: var(--bg);
            border-bottom: 1px solid var(--line);
            gap: 10px;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .appshell-hamburger {
            width: 34px; height: 34px; border-radius: var(--radius);
            background: var(--chip); border: 1px solid var(--line);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--ink); flex-shrink: 0;
          }

          .appshell-topbar-logo {
            display: flex; align-items: center; gap: 8px;
            text-decoration: none; flex: 1;
          }

          /* Backdrop */
          .appshell-backdrop {
            display: block;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
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
            width: min(300px, 88vw);
            background: var(--bg);
            border-right: 1px solid var(--line);
            z-index: 400;
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
            margin: 0 0 0;
            height: 60px;
            background: var(--bg);
            border-top: 1px solid var(--line);
            display: flex; align-items: center;
            position: relative; overflow: hidden; padding: 0 4px;
          }
        }

        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
