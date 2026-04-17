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
  ShieldCheck,
  Sun,
  Moon,
  Bell,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <SquaresFour size={20} weight="regular" />, activeIcon: <SquaresFour size={20} weight="fill" />, roles: ["admin", "manager"], color: "#F26A21" },
  { href: "/billing",   label: "Billing",   icon: <Receipt    size={20} weight="regular" />, activeIcon: <Receipt    size={20} weight="fill" />, color: "#4CAF50" },
  { href: "/menu",      label: "Menu",      icon: <ForkKnife  size={20} weight="regular" />, activeIcon: <ForkKnife  size={20} weight="fill" />, roles: ["admin", "manager"], color: "#0891B2" },
  { href: "/menu/ai-upload", label: "AI Upload", icon: <Sparkle size={20} weight="regular" />, activeIcon: <Sparkle size={20} weight="fill" />, roles: ["admin"], color: "#7C3AED" },
  { href: "/reports",  label: "Reports",  icon: <ChartBar size={20} weight="regular" />, activeIcon: <ChartBar size={20} weight="fill" />, roles: ["admin", "manager"], color: "#D97706" },
  { href: "/settings", label: "Settings", icon: <Gear     size={20} weight="regular" />, activeIcon: <Gear     size={20} weight="fill" />, roles: ["admin"], color: "#64748B" },
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
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "manager" ? "Manager" : "Cashier";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <aside
      style={{
        width: collapsed ? 72 : 256,
        minWidth: collapsed ? 72 : 256,
        maxWidth: collapsed ? 72 : 256,
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        background: "var(--white)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, min-width 0.25s ease, max-width 0.25s ease",
        boxShadow: "var(--shadow-sm)",
        zIndex: 50,
      }}
    >
      {/* LOGO */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", height: 64, borderBottom: "1px solid var(--border)", flexShrink: 0, overflow: "hidden", textDecoration: "none" }}>
        <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 10, background: "var(--primary-10)", border: "1.5px solid var(--primary-20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image src="/logo.png" alt="MARGROS" width={24} height={24} style={{ objectFit: "contain" }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 900, color: "var(--charcoal)", letterSpacing: "0.07em", lineHeight: 1 }}>MARGROS</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>POS Platform</p>
          </div>
        )}
      </Link>

      {/* GREETING + TIME */}
      {!collapsed && (
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: "var(--gray)", fontWeight: 500, marginBottom: 4 }}>
            {greeting}, <strong style={{ color: "var(--primary)" }}>{user?.name?.split(" ")[0]}</strong> 👋
          </p>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--charcoal)", lineHeight: 1, letterSpacing: "-0.01em" }}>{time}</p>
          <p style={{ fontSize: 10, color: "var(--gray)", marginTop: 3, fontWeight: 500 }}>{date}</p>
        </div>
      )}

      {/* NAV LABEL */}
      {!collapsed && <p style={{ fontSize: 9, fontWeight: 700, color: "var(--gray)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 20px 6px", flexShrink: 0, opacity: 0.6 }}>Navigation</p>}
      {collapsed && <div style={{ height: 14, flexShrink: 0 }} />}

      {/* NAV ITEMS */}
      <nav style={{ padding: collapsed ? "0 6px" : "0 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <div key={item.href} style={{ position: "relative" }}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "10px 0" : "10px 14px",
                  borderRadius: 10,
                  color: active ? item.color : "var(--gray)",
                  background: active ? `${item.color}12` : "transparent",
                  borderLeft: active && !collapsed ? `3px solid ${item.color}` : "3px solid transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--gray-lighter)";
                    e.currentTarget.style.color = "var(--charcoal)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--gray)";
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22 }}>
                  {active ? item.activeIcon : item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    )}
                  </>
                )}
              </Link>

              {collapsed && active && (
                <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: item.color }} />
              )}

              {collapsed && (
                <span
                  className="nav-tip"
                  style={{
                    position: "absolute", left: "calc(100% + 14px)", top: "50%", transform: "translateY(-50%)",
                    background: "var(--charcoal)", color: "var(--cream)", fontSize: 12, fontWeight: 600,
                    padding: "5px 11px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none",
                    opacity: 0, transition: "opacity 0.15s ease", zIndex: 200,
                    boxShadow: "var(--shadow-md)",
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
      <div style={{ borderTop: "1px solid var(--border)", padding: collapsed ? "10px 8px" : "10px 12px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <button onClick={toggleTheme} title={dark ? "Light mode" : "Dark mode"}
          style={{ display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "10px 0" : "10px 12px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--gray)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, width: "100%", transition: "all 0.15s ease", whiteSpace: "nowrap", justifyContent: collapsed ? "center" : "flex-start" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gray-lighter)"; e.currentTarget.style.color = "var(--charcoal)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gray)"; }}
        >
          <span style={{ flexShrink: 0, display: "flex" }}>{dark ? <Sun size={20} weight="fill" color="#F59E0B" /> : <Moon size={20} weight="regular" />}</span>
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <div style={{ position: "relative" }}>
          <button title="Notifications"
            style={{ display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "10px 0" : "10px 12px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--gray)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, width: "100%", transition: "all 0.15s ease", whiteSpace: "nowrap", justifyContent: collapsed ? "center" : "flex-start" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gray-lighter)"; e.currentTarget.style.color = "var(--charcoal)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gray)"; }}
          >
            <span style={{ flexShrink: 0, display: "flex", position: "relative" }}>
              <Bell size={20} weight="regular" />
              <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--primary)", color: "white", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--white)" }}>3</span>
            </span>
            {!collapsed && <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>Notifications<span style={{ background: "var(--primary)", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>3</span></span>}
          </button>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 14px", flexShrink: 0 }} />

      {/* USER */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "14px 0" : "14px 16px", justifyContent: collapsed ? "center" : "flex-start", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: "50%", background: "linear-gradient(135deg, #F26A21, #FF8C4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14 }}>
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <ShieldCheck size={11} weight="fill" color="var(--primary)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>{roleLabel}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOGOUT */}
      <button onClick={logout} title="Log out"
        style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, padding: collapsed ? "13px 0" : "12px 18px", background: "none", border: "none", borderTop: "1px solid var(--border)", cursor: "pointer", color: "var(--gray)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, width: "100%", transition: "color 0.15s ease, background 0.15s ease", flexShrink: 0, overflow: "hidden", whiteSpace: "nowrap" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray)"; e.currentTarget.style.background = "none"; }}
      >
        <SignOut size={17} weight="regular" style={{ flexShrink: 0 }} />
        {!collapsed && <span>Log out</span>}
      </button>

      <style jsx>{`
        div[style*="position: relative"]:hover .nav-tip { opacity: 1 !important; }
      `}</style>
    </aside>
  );
}
