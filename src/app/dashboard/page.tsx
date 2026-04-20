"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider, useOrders } from "@/context/OrderContext";
import { ToastProvider } from "@/components/Toast";
import {
  Receipt,
  Desktop,
  ForkKnife,
  ChartLine,
  Clock,
  Trophy,
  TrendUp,
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

  const recentOrders = orders.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    {
      idx: "01",
      label: "Today's Sales",
      value: `₹${todaySales.toLocaleString("en-IN")}`,
      trend: "+12% vs yesterday",
      trendDir: "up",
    },
    {
      idx: "02",
      label: "Monthly Revenue",
      value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,
      trend: "Running total",
      trendDir: "neutral",
    },
    {
      idx: "03",
      label: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      trend: `${recentOrders.length} today`,
      trendDir: "neutral",
    },
    {
      idx: "04",
      label: "Avg Order Value",
      value: `₹${avgOrderValue}`,
      trend: "Per transaction",
      trendDir: "neutral",
    },
  ];

  return (
    <AppShell
      title={`${greeting}, ${user?.name?.split(" ")[0] ?? "there"}.`}
      subtitle={`${user?.restaurantName ?? "MARGROS"} · Overview`}
    >
      {/* Header action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
        <button
          className="btn btn-outline"
          onClick={() => router.push("/billing")}
          style={{ gap: 8 }}
        >
          <Desktop size={15} weight="regular" />
          New Order
        </button>
        <button
          className="btn btn-outline"
          onClick={() => router.push("/menu")}
          style={{ gap: 8 }}
        >
          <ForkKnife size={15} weight="regular" />
          Menu
        </button>
        <button
          className="btn btn-outline"
          onClick={() => router.push("/reports")}
          style={{ gap: 8 }}
        >
          <ChartLine size={15} weight="regular" />
          Reports
        </button>
      </div>

      {/* KPI Grid — editorial style */}
      <div className="kpi-grid stagger" style={{ marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">
              <span className="idx mono">{k.idx}</span>
              {k.label}
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-trend" style={{ marginTop: 4 }}>
              {k.trendDir === "up" && <TrendUp size={12} />}
              {k.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Top Seller + Recent Orders */}
      <div className="dashboard-bottom-grid">

        {/* Top Seller */}
        <div className="card card-padded" style={{ animation: "fadeUp 0.4s ease both", animationDelay: "120ms", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="kpi-label">
            <Trophy size={13} weight="fill" />
            Top Seller
          </div>
          {/* Hatched swatch */}
          <div style={{
            height: 80, borderRadius: "var(--radius)",
            background: "repeating-linear-gradient(45deg, var(--chip) 0 8px, var(--bg-alt) 8px 16px)",
            border: "1px solid var(--line-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 32 }}>🏆</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              {topSellingItem}
            </p>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Most ordered item
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ animation: "fadeUp 0.4s ease both", animationDelay: "200ms", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>Recent Orders</p>
              <p className="eyebrow" style={{ marginTop: 2 }}>Latest transactions</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => router.push("/reports")}>
              View all
            </button>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                    <td style={{ color: "var(--muted)" }}>
                      {o.items.slice(0, 2).map((i) => i.name).join(", ")}
                      {o.items.length > 2 ? ` +${o.items.length - 2}` : ""}
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>₹{o.total.toLocaleString("en-IN")}</td>
                    <td><span className="badge">{o.payment}</span></td>
                    <td style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--muted)" }}>
                      <Clock size={12} weight="regular" />
                      <span className="mono">{new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
