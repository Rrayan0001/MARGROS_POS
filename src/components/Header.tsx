"use client";

import React, { useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  title: string;
  subtitle?: string;

}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";

  return (
    <header className="app-header">
      <div className="header-left">

        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle ? (
            <p className="header-sub">{subtitle}</p>
          ) : (
            <p className="header-sub">
              {greetEmoji} {greeting},{" "}
              <strong style={{ color: "var(--primary)" }}>
                {user?.name?.split(" ")[0]}
              </strong>
            </p>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-time">
          <span className="time-str">{timeStr}</span>
          <span className="date-str">{dateStr}</span>
        </div>

        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle theme">
          {dark ? <Sun size={18} weight="fill" color="var(--primary)" /> : <Moon size={18} weight="regular" />}
        </button>

{user && (
          <div className="header-avatar-wrap">
            <div
              className="avatar"
              style={{
                width: 36,
                height: 36,
                fontSize: 14,
                background: "linear-gradient(135deg, var(--primary), #FF8C4A)",
                cursor: "pointer",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="header-avatar-online" />
          </div>
        )}
      </div>

      <style jsx>{`
        .app-header {
          height: var(--header-height);
          background: var(--white);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          gap: 12px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .header-title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 800;
          color: var(--charcoal);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-sub {
          font-size: 12px;
          color: var(--gray);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .header-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 4px;
        }
        .time-str {
          font-family: var(--font-heading);
          font-size: 15px;
          font-weight: 700;
          color: var(--charcoal);
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .date-str {
          font-size: 10px;
          color: var(--gray);
          margin-top: 1px;
        }
        .header-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--gray-lighter);
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--gray);
          transition: all var(--transition-fast);
          position: relative;
          flex-shrink: 0;
        }
        .header-icon-btn:hover {
          background: var(--primary-10);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-1px);
        }
        .notif-btn { position: relative; }
        .notif-dot {
          position: absolute;
          top: 6px; right: 7px;
          width: 8px; height: 8px;
          background: var(--primary);
          border-radius: 50%;
          border: 2px solid var(--white);
        }
        .notif-badge {
          position: absolute;
          top: -4px; right: -4px;
          width: 16px; height: 16px;
          background: var(--primary);
          border-radius: 50%;
          font-size: 9px;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }
        .header-avatar-wrap {
          position: relative;
          margin-left: 2px;
        }
        .header-avatar-online {
          position: absolute;
          bottom: 0; right: 0;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--secondary);
          border: 2px solid var(--white);
        }

        /* Hamburger — hidden on desktop, shown on mobile */
        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--gray-lighter);
          border: 1.5px solid var(--border);
          cursor: pointer;
          color: var(--charcoal);
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }
        .hamburger-btn:hover {
          background: var(--primary-10);
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .app-header { padding: 0 14px; }
          .hamburger-btn { display: flex; }
          .header-time { display: none; }
          .header-title { font-size: 15px; }
        }

        @media (max-width: 400px) {
          .header-icon-btn:not(.notif-btn) { display: none; }
        }
      `}</style>
    </header>
  );
}
