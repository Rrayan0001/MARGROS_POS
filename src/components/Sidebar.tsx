"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  SquaresFour,
  Receipt,
  ForkKnife,
  ChartBar,
  Gear,
  Sparkle,
  SignOut,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Dashboard", Icon: SquaresFour, kbd: "D", roles: ["admin", "manager"] },
  { href: "/billing",       label: "Billing",   Icon: Receipt,     kbd: "B" },
  { href: "/menu",          label: "Menu",       Icon: ForkKnife,   kbd: "M", roles: ["admin", "manager"] },
  { href: "/menu/ai-upload",label: "AI Upload",  Icon: Sparkle,     kbd: "A", roles: ["admin"] },
  { href: "/reports",       label: "Reports",    Icon: ChartBar,    kbd: "R", roles: ["admin", "manager"] },
  { href: "/settings",      label: "Settings",   Icon: Gear,        kbd: "S", roles: ["admin"] },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [dark, setDark] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const pathname = usePathname();
  const { user, logout } = useAuth();

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

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return (
    <aside
      style={{
        width: collapsed ? 72 : 248,
        minWidth: collapsed ? 72 : 248,
        maxWidth: collapsed ? 72 : 248,
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        background: "var(--bg)",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s ease, min-width 0.22s ease, max-width 0.22s ease",
        zIndex: 50,
      }}
    >
      {/* WORDMARK */}
      <Link
        href="/dashboard"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px", height: 64, borderBottom: "1px solid var(--line)",
          flexShrink: 0, overflow: "hidden", textDecoration: "none",
        }}
      >
        <div style={{
          width: 28, height: 28, minWidth: 28, border: "1.5px solid var(--ink)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em",
          position: "relative", flexShrink: 0,
        }}>
          <Image src="/logo.png" alt="M" width={18} height={18} style={{ objectFit: "contain" }} />
          <span style={{ position: "absolute", inset: 3, border: "1px solid var(--ink)", opacity: 0.18 }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 800, color: "var(--ink)", letterSpacing: "0.18em", lineHeight: 1 }}>MARGROS</p>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 3 }}>POS · v2.6</p>
          </div>
        )}
      </Link>

      {/* GREETING + TIME */}
      {!collapsed && (
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
            {greeting}, <span style={{ color: "var(--ink)" }}>{user?.name?.split(" ")[0]}</span>
          </p>
          <p style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 600, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{time}</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{date}</p>
        </div>
      )}
      {collapsed && <div style={{ height: 14, flexShrink: 0 }} />}

      {/* NAV LABEL */}
      {!collapsed && (
        <p style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 20px 8px", flexShrink: 0 }}>
          Workspace
        </p>
      )}

      {/* NAV ITEMS */}
      <nav style={{ padding: collapsed ? "0 6px" : "0 8px", display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <div key={item.href} style={{ position: "relative" }}>
              <Link
                href={item.href}
                style={{
                  display: "flex", alignItems: "center",
                  gap: 12, padding: collapsed ? "10px 0" : "10px 12px",
                  borderRadius: "var(--radius)",
                  color: active ? "var(--bg)" : "var(--ink-2)",
                  background: active ? "var(--ink)" : "transparent",
                  border: "1px solid transparent",
                  fontFamily: "var(--sans)", fontSize: 14, fontWeight: active ? 500 : 400,
                  textDecoration: "none", transition: "all 120ms ease",
                  whiteSpace: "nowrap", justifyContent: collapsed ? "center" : "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--chip)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                  <item.Icon size={16} weight={active ? "fill" : "regular"} />
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: active ? "var(--bg)" : "var(--muted)", opacity: active ? 0.5 : 1 }}>{item.kbd}</span>
                  </>
                )}
              </Link>

              {collapsed && (
                <span
                  className="nav-tip"
                  style={{
                    position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)",
                    background: "var(--ink)", color: "var(--bg)", fontFamily: "var(--mono)",
                    fontSize: 11, fontWeight: 500, padding: "5px 10px",
                    borderRadius: "var(--radius)", whiteSpace: "nowrap", pointerEvents: "none",
                    opacity: 0, transition: "opacity 120ms ease", zIndex: 200,
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* UTILITY ACTIONS */}
      <div style={{ borderTop: "1px solid var(--line)", padding: collapsed ? "8px 6px" : "8px 8px", flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Light mode" : "Dark mode"}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: collapsed ? "10px 0" : "10px 12px",
            borderRadius: "var(--radius)", background: "transparent", border: "none",
            cursor: "pointer", color: "var(--muted)", fontFamily: "var(--sans)",
            fontSize: 14, fontWeight: 400, width: "100%",
            transition: "all 120ms ease", whiteSpace: "nowrap",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chip)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <span style={{ flexShrink: 0, display: "flex" }}>
            {dark ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />}
          </span>
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "var(--line)", margin: "0 14px", flexShrink: 0 }} />

      {/* USER */}
      {user && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "14px 0" : "14px 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0, overflow: "hidden",
        }}>
          <div className="avatar" style={{ width: 30, height: 30, minWidth: 30, fontSize: 11 }}>
            {user.name.charAt(0)}{user.name.split(" ")[1]?.charAt(0) ?? ""}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>{user.role}</p>
            </div>
          )}
        </div>
      )}

      {/* LOGOUT */}
      <button
        onClick={logout}
        title="Log out"
        style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: collapsed ? "13px 0" : "12px 18px",
          background: "none", border: "none", borderTop: "1px solid var(--line)",
          cursor: "pointer", color: "var(--muted)", fontFamily: "var(--sans)",
          fontSize: 13.5, fontWeight: 400, width: "100%",
          transition: "color 120ms ease, background 120ms ease",
          flexShrink: 0, overflow: "hidden", whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.background = "var(--chip)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "none"; }}
      >
        <SignOut size={15} weight="regular" style={{ flexShrink: 0 }} />
        {!collapsed && <span>Log out</span>}
      </button>

      <style jsx>{`
        div[style*="position: relative"]:hover .nav-tip { opacity: 1 !important; }
      `}</style>
    </aside>
  );
}
