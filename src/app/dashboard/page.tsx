"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider, useOrders } from "@/context/OrderContext";
import { ToastProvider } from "@/components/Toast";
import {
  CurrencyInr,
  TrendUp,
  ShoppingCart,
  Calculator,
  Trophy,
  Receipt,
  ForkKnife,
  ChartLine,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "@phosphor-icons/react";

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    orders,
    todaySales,
    monthlyRevenue,
    totalOrders,
    avgOrderValue,
    topSellingItem,
  } = useOrders();

  const kpis = [
    {
      label: "Today's Sales",
      value: `₹${todaySales.toLocaleString("en-IN")}`,
      icon: <CurrencyInr size={22} weight="fill" />,
      color: "#F26A21",
      bg: "linear-gradient(135deg, rgba(242,106,33,0.12), rgba(242,106,33,0.04))",
      border: "rgba(242,106,33,0.18)",
      trend: "+12.4%",
      up: true,
    },
    {
      label: "Monthly Revenue",
      value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,
      icon: <TrendUp size={22} weight="fill" />,
      color: "#4CAF50",
      bg: "linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.04))",
      border: "rgba(76,175,80,0.18)",
      trend: "+8.1%",
      up: true,
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      icon: <ShoppingCart size={22} weight="fill" />,
      color: "#7C3AED",
      bg: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04))",
      border: "rgba(124,58,237,0.18)",
      trend: "+5.2%",
      up: true,
    },
    {
      label: "Avg Order Value",
      value: `₹${avgOrderValue}`,
      icon: <Calculator size={22} weight="fill" />,
      color: "#0891B2",
      bg: "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(8,145,178,0.04))",
      border: "rgba(8,145,178,0.18)",
      trend: "-1.8%",
      up: false,
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const quickActions = [
    { label: "New Bill",     icon: <Receipt   size={24} weight="duotone" />, color: "#F26A21", href: "/billing" },
    { label: "Menu",         icon: <ForkKnife size={24} weight="duotone" />, color: "#0891B2", href: "/menu"    },
    { label: "Reports",      icon: <ChartLine size={24} weight="duotone" />, color: "#D97706", href: "/reports" },
  ];

  return (
    <AppShell title="Dashboard" subtitle={`${user?.restaurantName} — Overview`}>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        {quickActions.map((a) => (
          <button
            key={a.href}
            onClick={() => router.push(a.href)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8,
              padding: "16px 8px", borderRadius: 14,
              background: `${a.color}10`,
              border: `1.5px solid ${a.color}22`,
              cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}1E`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span style={{ color: a.color }}>{a.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--charcoal)", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid stagger" style={{ marginBottom: 28 }}>
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="kpi-card"
            style={{ animationDelay: `${i * 60}ms`, background: k.bg, border: `1.5px solid ${k.border}`, boxShadow: "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--white)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: k.color, boxShadow: `0 4px 12px ${k.color}20`,
                border: `1px solid ${k.border}`,
              }}>
                {k.icon}
              </div>
              <span style={{
                display: "flex", alignItems: "center", gap: 3,
                background: k.up ? "rgba(76,175,80,0.1)" : "rgba(239,68,68,0.1)",
                color: k.up ? "#4CAF50" : "#EF4444",
                padding: "3px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700,
              }}>
                {k.up ? <ArrowUpRight size={12} weight="bold" /> : <ArrowDownRight size={12} weight="bold" />}
                {k.trend}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value" style={{ fontSize: 24, marginTop: 2, color: k.color }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Selling Item */}
      <div style={{
        borderRadius: 16, padding: "16px 20px", marginBottom: 24,
        background: "linear-gradient(135deg, rgba(217,119,6,0.10), rgba(217,119,6,0.03))",
        border: "1.5px solid rgba(217,119,6,0.18)",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 13, flexShrink: 0,
          background: "var(--white)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#D97706", boxShadow: "0 4px 12px rgba(217,119,6,0.18)",
          border: "1px solid rgba(217,119,6,0.18)",
        }}>
          <Trophy size={24} weight="fill" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Selling Item</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#D97706", marginTop: 3, fontFamily: "var(--font-heading)" }}>{topSellingItem}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#D97706",
          background: "rgba(217,119,6,0.12)", padding: "4px 12px",
          borderRadius: 100,
        }}>🔥 Hot</span>
      </div>

      {/* Recent Orders */}
      <div className="card card-padded" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "300ms" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "var(--primary-10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)",
            }}>
              <Receipt size={17} weight="fill" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700 }}>Recent Orders</h3>
              <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>Latest transactions</p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => router.push("/reports")}>View All</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><strong style={{ fontFamily: "var(--font-heading)", fontSize: 13 }}>{o.id}</strong></td>
                  <td style={{ color: "var(--gray)", fontSize: 13 }}>
                    {o.items.slice(0, 2).map((i) => i.name).join(", ")}
                    {o.items.length > 2 ? ` +${o.items.length - 2}` : ""}
                  </td>
                  <td><strong style={{ color: "var(--primary)" }}>₹{o.total.toLocaleString("en-IN")}</strong></td>
                  <td><span className="badge badge-gray">{o.payment}</span></td>
                  <td style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--gray)", fontSize: 13 }}>
                    <Clock size={13} weight="regular" /> {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <DashboardContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
